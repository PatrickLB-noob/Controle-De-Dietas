import {
  salvarNaNuvem,
  buscarEstatisticasNaNuvem,
  excluirEstatisticaNaNuvem,
} from "./firebase.js";

import { calcularQuentinhas } from "./quentinhas.js";

const resumoTexto = document.getElementById("resumoTexto");
const btnSalvar = document.getElementById("btnSalvar");
const btnCopiar = document.getElementById("btnCopiar");

const listaHistorico = document.getElementById("listaHistorico");
const estatisticaCompleta = document.getElementById("estatisticaCompleta");
const btnCopiarHistorico = document.getElementById("btnCopiarHistorico");
const btnVoltarHistorico = document.getElementById("btnVoltarHistorico");
const btnFecharHistorico = document.getElementById("btnFecharHistorico");

let ultimaEstatisticaGerada = null;
let historicoAtual = [];

function identificarRefeicao() {
  const hora = new Date().getHours();

  if (hora >= 10 && hora < 14) {
    return "Almoço";
  }

  if (hora >= 16 && hora < 18) {
    return "Jantar";
  }

  return "Outra";
}

function criarIdLocal() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function dataParaTimestamp(dataTexto) {
  if (!dataTexto) return 0;

  const dataDireta = new Date(dataTexto).getTime();

  if (!Number.isNaN(dataDireta)) {
    return dataDireta;
  }

  const partes = dataTexto.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?/,
  );

  if (!partes) return 0;

  const dia = Number(partes[1]);
  const mes = Number(partes[2]) - 1;
  const ano = Number(partes[3]);
  const hora = Number(partes[4] || 0);
  const minuto = Number(partes[5] || 0);
  const segundo = Number(partes[6] || 0);

  return new Date(ano, mes, dia, hora, minuto, segundo).getTime();
}

function ordenarMaisRecentesPrimeiro(lista) {
  return [...lista].sort(function (a, b) {
    const dataB = b.criadoEm || dataParaTimestamp(b.data);
    const dataA = a.criadoEm || dataParaTimestamp(a.data);

    return dataB - dataA;
  });
}

function obterHistoricoLocal() {
  return JSON.parse(localStorage.getItem("estatisticas")) || [];
}

function salvarHistoricoLocal(historico) {
  localStorage.setItem("estatisticas", JSON.stringify(historico));
}

function removerDoHistoricoLocal(itemParaExcluir) {
  const historicoLocal = obterHistoricoLocal();

  const novoHistorico = historicoLocal.filter(function (item) {
    if (itemParaExcluir.id && item.id === itemParaExcluir.id) {
      return false;
    }

    if (
      itemParaExcluir.localId &&
      item.localId === itemParaExcluir.localId
    ) {
      return false;
    }

    if (
      item.data === itemParaExcluir.data &&
      item.resumo === itemParaExcluir.resumo
    ) {
      return false;
    }

    return true;
  });

  salvarHistoricoLocal(novoHistorico);
}

function gerarResumo(dados) {
  const {
    pure,
    ptn,
    macarrao,
    respostasGrandes,
    respostasPequenas,
    respostasEspeciais,
    sopa,
    feijao,
  } = dados;

  const data = new Date().toLocaleString();
  const refeicao = identificarRefeicao();
  const criadoEm = Date.now();

  let texto = "";

  texto += `ESTATÍSTICA ${refeicao.toUpperCase()}\n\n`;

  texto += `PURÊ: ${pure}\n`;
  texto += `PTN PICADA: ${ptn}\n`;
  texto += `MACARRÃO: ${macarrao}\n\n`;

  texto += "========== DIETAS ==========\n\n";

  for (let dieta in respostasGrandes) {
    const grande = respostasGrandes[dieta];

    const pequena =
      respostasPequenas[dieta] !== undefined ? respostasPequenas[dieta] : 0;

    if (dieta === "Acompanhante") {
      texto += `${dieta} G: ${grande}\n`;
    } else {
      texto += `${dieta} G: ${grande} P: ${pequena}\n`;
    }
  }

  texto += `PED G: ${respostasEspeciais.PED.G} P: ${respostasEspeciais.PED.P}\n`;
  texto += `PSIQUIATRIA G: ${respostasEspeciais.PSIQUIATRIA.G} P: ${respostasEspeciais.PSIQUIATRIA.P}\n`;

  texto += "\n========== SOPAS ==========\n\n";
  texto += `Sopa Pedaço: ${sopa.pedaco}\n`;
  texto += `Sopa Batida: ${sopa.batida}\n`;

  texto += "\n========== FEIJÕES ==========\n\n";
  texto += `Liquidificado: ${feijao.liquidificado}\n`;
  texto += `Caldo: ${feijao.caldo}\n`;
  texto += `Batido: ${feijao.batido}\n`;
  texto += `Caroço: ${feijao.caroco}\n`;
  texto += `No Copo: ${feijao.noCopo}\n`;

  const quentinhas = calcularQuentinhas(dados);

  resumoTexto.textContent = texto;

  ultimaEstatisticaGerada = {
    localId: criarIdLocal(),
    data,
    criadoEm,
    refeicao,
    resumo: texto,
    quentinhas,
    sincronizado: false,
  };
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    alert("Copiado!");
  } catch (erro) {
    alert("Não foi possível copiar.");
    console.error(erro);
  }
}

btnSalvar.addEventListener("click", async function () {
  if (!ultimaEstatisticaGerada) {
    alert("Nenhuma estatística foi gerada ainda.");
    return;
  }

  if (ultimaEstatisticaGerada.sincronizado && ultimaEstatisticaGerada.id) {
    alert("Esta estatística já foi salva.");
    return;
  }

  const historico = obterHistoricoLocal();

  const jaSalva = historico.some(function (item) {
    return item.localId === ultimaEstatisticaGerada.localId;
  });

  if (!jaSalva) {
    historico.push(ultimaEstatisticaGerada);
    salvarHistoricoLocal(historico);
  }

  console.log("Salvo localmente:", ultimaEstatisticaGerada);

  try {
    const idFirebase = await salvarNaNuvem(ultimaEstatisticaGerada);

    ultimaEstatisticaGerada.id = idFirebase;
    ultimaEstatisticaGerada.sincronizado = true;

    const historicoAtualizado = obterHistoricoLocal().map(function (item) {
      if (item.localId === ultimaEstatisticaGerada.localId) {
        return ultimaEstatisticaGerada;
      }

      return item;
    });

    salvarHistoricoLocal(historicoAtualizado);

    alert("Estatística salva localmente e na nuvem!");
  } catch (erro) {
    console.error("Erro ao salvar na nuvem:", erro);
    alert("Sem internet: estatística salva apenas no aparelho.");
  }
});

btnCopiar.addEventListener("click", function () {
  copiarTexto(resumoTexto.textContent);
});

async function carregarHistorico() {
  listaHistorico.innerHTML = "";

  try {
    historicoAtual = await buscarEstatisticasNaNuvem();
    console.log("Histórico carregado da nuvem:", historicoAtual);
  } catch (erro) {
    console.error("Erro ao buscar no Firebase:", erro);
    historicoAtual = obterHistoricoLocal();
  }

  historicoAtual = ordenarMaisRecentesPrimeiro(historicoAtual);

  if (historicoAtual.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.textContent = "Nenhuma estatística salva.";
    listaHistorico.appendChild(mensagem);
    return;
  }

  historicoAtual.forEach(function (item, indice) {
    const linha = document.createElement("div");
    linha.classList.add("item-historico");

    const texto = document.createElement("span");
    texto.textContent = `${item.refeicao || "Sem refeição"} - ${item.data}`;

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "🗑️";
    btnExcluir.classList.add("btn-excluir");

    linha.addEventListener("click", function () {
      abrirEstatistica(indice);
    });

    btnExcluir.addEventListener("click", async function (event) {
      event.stopPropagation();

      const confirmar = confirm("Deseja excluir esta estatística?");

      if (!confirmar) return;

      try {
        if (item.id) {
          await excluirEstatisticaNaNuvem(item.id);
        }

        removerDoHistoricoLocal(item);

        await carregarHistorico();

        alert("Estatística excluída!");
      } catch (erro) {
        console.error("Erro ao excluir:", erro);
        alert("Não foi possível excluir da nuvem. Tente novamente com internet.");
      }
    });

    linha.appendChild(texto);
    linha.appendChild(btnExcluir);

    listaHistorico.appendChild(linha);
  });
}

function abrirEstatistica(indice) {
  const item = historicoAtual[indice];

  if (!item) {
    alert("Não foi possível abrir esta estatística.");
    return;
  }

  estatisticaCompleta.textContent = item.resumo;

  window.abrirTelaVisualizar();
}

btnCopiarHistorico.addEventListener("click", function () {
  copiarTexto(estatisticaCompleta.textContent);
});

btnVoltarHistorico.addEventListener("click", function () {
  carregarHistorico();
  window.abrirTelaHistorico();
});

btnFecharHistorico.addEventListener("click", function () {
  window.abrirTelaMenu();
});

export { gerarResumo, carregarHistorico };
