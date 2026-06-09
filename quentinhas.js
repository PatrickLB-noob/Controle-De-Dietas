import {
  salvarQuentinhasEmAndamento,
  buscarQuentinhasEmAndamento,
  buscarQuentinhasFinalizadas,
  observarQuentinhasPorId,
  excluirQuentinhaNaNuvem,
  salvarQuentinhaFinalizada,
  excluirQuentinhaEmAndamento,
} from "./firebase.js";

const quentinhasTexto = document.getElementById("quentinhasTexto");
const quentinhasTitulo = document.getElementById("quentinhasTitulo");
const listaQuentinhas = document.getElementById("listaQuentinhas");

let pararObservadorQuentinhas = null;
let sessaoQuentinhasAtual = null;
let ultimaQuentinhaAtual = null;
let quentinhaAbertaAtual = null;
let btnExcluirQuentinhaAberta = null;

function garantirBotaoExcluirQuentinhaAberta() {
  if (btnExcluirQuentinhaAberta) {
    return btnExcluirQuentinhaAberta;
  }

  btnExcluirQuentinhaAberta = document.createElement("button");
  btnExcluirQuentinhaAberta.id = "btnExcluirQuentinhaAberta";
  btnExcluirQuentinhaAberta.textContent = "Excluir quentinha";
  btnExcluirQuentinhaAberta.classList.add("btn-excluir-quentinha-aberta", "hidden");

  btnExcluirQuentinhaAberta.addEventListener("click", async function () {
    if (!quentinhaAbertaAtual) {
      return;
    }

    const confirmar = confirm("Deseja excluir esta quentinha?");
    if (!confirmar) {
      return;
    }

    try {
      await excluirQuentinhaNaNuvem(
        quentinhaAbertaAtual.id,
        quentinhaAbertaAtual.status
      );

      pararObservadorAtual();
      quentinhaAbertaAtual = null;

      await carregarListaQuentinhas();
    } catch (erro) {
      alert("Erro ao excluir quentinha.");
      console.error(erro);
    }
  });

  if (quentinhasTexto && quentinhasTexto.parentNode) {
    quentinhasTexto.parentNode.insertBefore(
      btnExcluirQuentinhaAberta,
      quentinhasTexto.nextSibling
    );
  }

  return btnExcluirQuentinhaAberta;
}

function mostrarBotaoExcluirQuentinhaAberta(id, status) {
  const botao = garantirBotaoExcluirQuentinhaAberta();

  quentinhaAbertaAtual = {
    id,
    status,
  };

  botao.classList.remove("hidden");
}

function esconderBotaoExcluirQuentinhaAberta() {
  const botao = garantirBotaoExcluirQuentinhaAberta();

  quentinhaAbertaAtual = null;
  botao.classList.add("hidden");
}

function criarBotaoVoltarListaQuentinhas() {
  const botaoVoltarLista = document.createElement("button");

  botaoVoltarLista.textContent = "Voltar para lista";
  botaoVoltarLista.addEventListener("click", function () {
    carregarListaQuentinhas();
  });

  return botaoVoltarLista;
}

const regrasRampas = [
  {
    nome: "Normal",
    dietas: ["Normal", "Acompanhante"],
  },
  {
    nome: "Hipolipídica",
    dietas: ["Hipolipídica", "Neutropênica", "Celíaca"],
  },
  {
    nome: "DB",
    dietas: ["DB", "Neutropênica DB", "Celíaca DB"],
  },
  {
    nome: "Sem sal",
    dietas: [
      "DB Sem Sal",
      "Neutropênica DB Sem Sal",
      "Celíaca DB Sem Sal",
      "Hipolipídica Sem Sal",
      "Neutropênica Sem Sal",
      "Celíaca Sem Sal",
      "Normal Sem Sal",
    ],
  },
  {
    nome: "60 g",
    dietas: ["60g", "60g DB", "60g Sem Sal", "60g DB Sem Sal"],
  },
  {
    nome: "Pediatria",
    especial: "PED",
  },
  {
    nome: "Psiquiatria",
    especial: "PSIQUIATRIA",
  },
  {
    nome: "Pastosa",
    dietas: ["Pastosa", "Pastosa DB"],
  },
  {
    nome: "Homogênea",
    dietas: ["Pastosa Homogênea", "Pastosa Sem Sal", "Pastosa DB Sem Sal"],
  },
  {
    nome: "Sem Resíduo",
    dietas: [
      "Pastosa Sem Resíduo",
      "Sem Resíduo",
      "Hipocaliêmica (2,5K)",
      "Pastosa Hipocaliêmica(2,5k)",
    ],
  },
];

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

function normalizarTextoParaId(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function obterDataCurta(data = new Date()) {
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function obterHorarioCurto(data = new Date()) {
  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obterDataIdLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterHorarioIdLocal(data = new Date()) {
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  const segundo = String(data.getSeconds()).padStart(2, "0");

  return `${hora}-${minuto}-${segundo}`;
}

function criarSessaoQuentinhas() {
  const agora = new Date();
  const refeicao = identificarRefeicao();
  const dataCurta = obterDataCurta(agora);
  const dataId = obterDataIdLocal(agora);
  const criadoEm = Date.now();

  // Em andamento: apenas uma por data + refeição.
  const id = `${dataId}_${normalizarTextoParaId(refeicao)}`;

  return {
    id,
    titulo: `${refeicao} ${dataCurta}`,
    refeicao,
    dataCurta,
    dataId,
    criadoEm,
    status: "em_andamento",
  };
}

function numero(valor) {
  return Number(valor) || 0;
}

function somarDietas(dietas, respostasGrandes, respostasPequenas) {
  let grandes = 0;
  let pequenas = 0;

  dietas.forEach(function (dieta) {
    grandes += numero(respostasGrandes[dieta]);
    pequenas += numero(respostasPequenas[dieta]);
  });

  return {
    grandes,
    pequenas,
  };
}

function calcularQuentinhas(dados) {
  const {
    respostasGrandes,
    respostasPequenas,
    respostasEspeciais,
  } = dados;

  const sessao = sessaoQuentinhasAtual || criarSessaoQuentinhas();

  const rampas = [];
  let totalGrandes = 0;
  let totalPequenas = 0;

  regrasRampas.forEach(function (regra) {
    let grandes = 0;
    let pequenas = 0;

    if (regra.especial) {
      grandes = numero(respostasEspeciais[regra.especial]?.G);
      pequenas = numero(respostasEspeciais[regra.especial]?.P);
    } else {
      const soma = somarDietas(
        regra.dietas,
        respostasGrandes,
        respostasPequenas
      );

      grandes = soma.grandes;
      pequenas = soma.pequenas;
    }

    totalGrandes += grandes;
    totalPequenas += pequenas;

    rampas.push({
      nome: regra.nome,
      grandes,
      pequenas,
    });
  });

  return {
    ...sessao,
    rampas,
    totalGrandes,
    totalPequenas,
  };
}

function formatarQuentinhas(quentinhas) {
  if (!quentinhas) {
    return "Nenhuma informação de quentinhas disponível.";
  }

  let texto = "";

  texto += `${quentinhas.titulo || "Quentinhas"}\n\n`;

  const rampas = quentinhas.rampas || [];

  rampas.forEach(function (rampa) {
    texto += `${rampa.nome}\n`;
    texto += `Grandes: ${numero(rampa.grandes)}\n`;
    texto += `Pequenas: ${numero(rampa.pequenas)}\n\n`;
  });

  texto += "========== TOTAL DE QUENTINHAS ==========\n\n";
  texto += `Grandes: ${numero(quentinhas.totalGrandes)}\n`;
  texto += `Pequenas: ${numero(quentinhas.totalPequenas)}\n`;

  return texto;
}

function mostrarQuentinhasNaTela(quentinhas) {
  if (!quentinhasTexto) return;

  if (quentinhasTitulo) {
    quentinhasTitulo.textContent = quentinhas?.titulo
      ? `Quentinhas - ${quentinhas.titulo}`
      : "Quentinhas";
  }

  quentinhasTexto.textContent = formatarQuentinhas(quentinhas);
}

async function iniciarSessaoQuentinhasAtual(dados) {
  sessaoQuentinhasAtual = criarSessaoQuentinhas();

  const quentinhas = calcularQuentinhas(dados);
  ultimaQuentinhaAtual = quentinhas;

  mostrarQuentinhasNaTela(quentinhas);

  try {
    await salvarQuentinhasEmAndamento(quentinhas);
  } catch (erro) {
    console.error("Erro ao criar sessão de quentinhas:", erro);
  }

  return quentinhas;
}

async function atualizarQuentinhasAtual(dados) {
  if (!sessaoQuentinhasAtual) {
    sessaoQuentinhasAtual = criarSessaoQuentinhas();
  }

  const quentinhas = calcularQuentinhas(dados);
  ultimaQuentinhaAtual = quentinhas;

  mostrarQuentinhasNaTela(quentinhas);

  try {
    await salvarQuentinhasEmAndamento(quentinhas);
  } catch (erro) {
    console.error("Erro ao atualizar quentinhas na nuvem:", erro);
  }

  return quentinhas;
}

function obterQuentinhasAtualCalculada() {
  return ultimaQuentinhaAtual;
}

async function finalizarQuentinhasAtual() {
  if (!ultimaQuentinhaAtual) {
    return null;
  }

  const agora = new Date();
  const horarioCurto = obterHorarioCurto(agora);
  const horarioFinalizacaoId = obterHorarioIdLocal(agora);

  const finalizada = {
    ...ultimaQuentinhaAtual,
    status: "finalizada",
    titulo: `${ultimaQuentinhaAtual.refeicao} ${ultimaQuentinhaAtual.dataCurta} ${horarioCurto}`,
    horarioCurto,
    horarioFinalizacaoId,
    finalizadaEmLocal: Date.now(),
  };

  try {
    const idFinalizado = await salvarQuentinhaFinalizada(finalizada);
    await excluirQuentinhaEmAndamento(ultimaQuentinhaAtual.id);

    sessaoQuentinhasAtual = null;
    ultimaQuentinhaAtual = null;

    return {
      ...finalizada,
      id: idFinalizado,
    };
  } catch (erro) {
    console.error("Erro ao finalizar quentinha:", erro);
    return finalizada;
  }
}

function pararObservadorAtual() {
  if (pararObservadorQuentinhas) {
    pararObservadorQuentinhas();
    pararObservadorQuentinhas = null;
  }
}

function abrirQuentinhasPorId(id, status = "em_andamento") {
  pararObservadorAtual();

  if (listaQuentinhas) {
    listaQuentinhas.innerHTML = "";
    listaQuentinhas.appendChild(criarBotaoVoltarListaQuentinhas());
  }

  if (quentinhasTexto) {
    quentinhasTexto.textContent = "Carregando quentinhas...";
  }

  mostrarBotaoExcluirQuentinhaAberta(id, status);

  pararObservadorQuentinhas = observarQuentinhasPorId(id, function (quentinhas) {
    if (!quentinhas) {
      mostrarQuentinhasNaTela(null);
      return;
    }

    mostrarQuentinhasNaTela(quentinhas);
  }, status);
}

function ordenarQuentinhasMaisRecentes(lista) {
  return [...lista].sort(function (a, b) {
    const dataB = b.finalizadaEmLocal || b.criadoEm || 0;
    const dataA = a.finalizadaEmLocal || a.criadoEm || 0;

    return dataB - dataA;
  });
}

function criarTituloLista(item) {
  return (
    item.titulo ||
    `${item.refeicao || "Refeição"} ${item.dataCurta || ""} ${item.horarioCurto || ""}`.trim()
  );
}

function adicionarTituloSecao(texto) {
  const titulo = document.createElement("h3");
  titulo.textContent = texto;
  listaQuentinhas.appendChild(titulo);
}

function adicionarMensagemSecao(texto) {
  const mensagem = document.createElement("p");
  mensagem.textContent = texto;
  listaQuentinhas.appendChild(mensagem);
}

function adicionarLinhaQuentinha(item, status) {
  const linha = document.createElement("div");
  linha.classList.add("item-historico");

  const texto = document.createElement("span");
  texto.textContent = criarTituloLista(item);

  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "🗑️";
  btnExcluir.classList.add("btn-excluir");

  btnExcluir.addEventListener("click", async function (event) {
    event.stopPropagation();

    const confirmar = confirm("Deseja excluir esta quentinha?");
    if (!confirmar) return;

    try {
      await excluirQuentinhaNaNuvem(item.id, status);
      carregarListaQuentinhas();
    } catch (erro) {
      alert("Erro ao excluir quentinha.");
      console.error(erro);
    }
  });

  linha.addEventListener("click", function () {
    abrirQuentinhasPorId(item.id, status);
  });

  linha.appendChild(texto);
  linha.appendChild(btnExcluir);
  listaQuentinhas.appendChild(linha);
}

async function carregarListaQuentinhas() {
  pararObservadorAtual();
  esconderBotaoExcluirQuentinhaAberta();

  if (quentinhasTitulo) {
    quentinhasTitulo.textContent = "Quentinhas";
  }

  if (quentinhasTexto) {
    quentinhasTexto.textContent = "Escolha uma refeição para acompanhar.";
  }

  if (!listaQuentinhas) return;

  listaQuentinhas.innerHTML = "";

  try {
    const [emAndamento, finalizadas] = await Promise.all([
      buscarQuentinhasEmAndamento(),
      buscarQuentinhasFinalizadas(),
    ]);

    adicionarTituloSecao("EM ANDAMENTO");

    const emAndamentoOrdenadas = ordenarQuentinhasMaisRecentes(emAndamento);

    if (emAndamentoOrdenadas.length === 0) {
      adicionarMensagemSecao("Nenhuma quentinha em andamento.");
    } else {
      emAndamentoOrdenadas.forEach(function (item) {
        adicionarLinhaQuentinha(item, "em_andamento");
      });
    }

    adicionarTituloSecao("FINALIZADAS");

    const finalizadasOrdenadas = ordenarQuentinhasMaisRecentes(finalizadas);

    if (finalizadasOrdenadas.length === 0) {
      adicionarMensagemSecao("Nenhuma quentinha finalizada.");
    } else {
      finalizadasOrdenadas.forEach(function (item) {
        adicionarLinhaQuentinha(item, "finalizada");
      });
    }
  } catch (erro) {
    console.error("Erro ao carregar quentinhas:", erro);

    const mensagem = document.createElement("p");
    mensagem.textContent = "Não foi possível carregar as quentinhas da nuvem.";
    listaQuentinhas.appendChild(mensagem);
  }
}

function iniciarObservadorQuentinhas() {
  carregarListaQuentinhas();
}

export {
  calcularQuentinhas,
  atualizarQuentinhasAtual,
  iniciarSessaoQuentinhasAtual,
  iniciarObservadorQuentinhas,
  carregarListaQuentinhas,
  formatarQuentinhas,
  finalizarQuentinhasAtual,
  obterQuentinhasAtualCalculada,
};
