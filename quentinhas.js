import {
  salvarQuentinhasAtual,
  buscarQuentinhasNaNuvem,
  observarQuentinhasPorId,
} from "./firebase.js";

const quentinhasTexto = document.getElementById("quentinhasTexto");
const quentinhasTitulo = document.getElementById("quentinhasTitulo");
const listaQuentinhas = document.getElementById("listaQuentinhas");

let pararObservadorQuentinhas = null;
let sessaoQuentinhasAtual = null;

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
  const horarioCurto = obterHorarioCurto(agora);
  const dataId = obterDataIdLocal(agora);
  const horarioId = obterHorarioIdLocal(agora);
  const criadoEm = Date.now();
  const id = `${dataId}_${normalizarTextoParaId(refeicao)}_${horarioId}`;

  return {
    id,
    titulo: `${refeicao} ${dataCurta} ${horarioCurto}`,
    refeicao,
    dataCurta,
    horarioCurto,
    dataId,
    horarioId,
    criadoEm,
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

  mostrarQuentinhasNaTela(quentinhas);

  try {
    await salvarQuentinhasAtual(quentinhas);
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

  mostrarQuentinhasNaTela(quentinhas);

  try {
    await salvarQuentinhasAtual(quentinhas);
  } catch (erro) {
    console.error("Erro ao atualizar quentinhas na nuvem:", erro);
  }

  return quentinhas;
}

function pararObservadorAtual() {
  if (pararObservadorQuentinhas) {
    pararObservadorQuentinhas();
    pararObservadorQuentinhas = null;
  }
}

function abrirQuentinhasPorId(id) {
  pararObservadorAtual();

  if (listaQuentinhas) {
    listaQuentinhas.innerHTML = "";
  }

  if (quentinhasTexto) {
    quentinhasTexto.textContent = "Carregando quentinhas...";
  }

  pararObservadorQuentinhas = observarQuentinhasPorId(id, function (quentinhas) {
    mostrarQuentinhasNaTela(quentinhas);
  });
}

function ordenarQuentinhasMaisRecentes(lista) {
  return [...lista].sort(function (a, b) {
    const dataB = b.criadoEm || 0;
    const dataA = a.criadoEm || 0;

    return dataB - dataA;
  });
}

async function carregarListaQuentinhas() {
  pararObservadorAtual();

  if (quentinhasTitulo) {
    quentinhasTitulo.textContent = "Quentinhas";
  }

  if (quentinhasTexto) {
    quentinhasTexto.textContent = "Escolha uma refeição para acompanhar.";
  }

  if (!listaQuentinhas) return;

  listaQuentinhas.innerHTML = "";

  try {
    const quentinhas = ordenarQuentinhasMaisRecentes(
      await buscarQuentinhasNaNuvem()
    );

    if (quentinhas.length === 0) {
      const mensagem = document.createElement("p");
      mensagem.textContent = "Nenhuma quentinha salva.";
      listaQuentinhas.appendChild(mensagem);
      return;
    }

    quentinhas.forEach(function (item) {
      const linha = document.createElement("div");
      linha.classList.add("item-historico");

      const texto = document.createElement("span");
      texto.textContent =
        item.titulo ||
        `${item.refeicao || "Refeição"} ${item.dataCurta || ""} ${item.horarioCurto || ""}`.trim();

      linha.addEventListener("click", function () {
        abrirQuentinhasPorId(item.id);
      });

      linha.appendChild(texto);
      listaQuentinhas.appendChild(linha);
    });
  } catch (erro) {
    console.error("Erro ao carregar quentinhas:", erro);

    const mensagem = document.createElement("p");
    mensagem.textContent = "Não foi possível carregar as quentinhas da nuvem.";
    listaQuentinhas.appendChild(mensagem);
  }
}

// Mantida por compatibilidade, mas agora a tela lista as refeições primeiro.
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
};
