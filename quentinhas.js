import {
  salvarQuentinhasAtual,
  observarQuentinhasAtual,
} from "./firebase.js";

const quentinhasTexto = document.getElementById("quentinhasTexto");
const quentinhasTitulo = document.getElementById("quentinhasTitulo");

let pararObservadorQuentinhas = null;

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

function obterDataCurta() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function obterDataIdLocal() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
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

  const refeicao = identificarRefeicao();
  const dataCurta = obterDataCurta();
  const dataId = obterDataIdLocal();

  return {
    titulo: `${refeicao} ${dataCurta}`,
    refeicao,
    dataCurta,
    dataId,
    criadoEm: Date.now(),
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

  quentinhas.rampas.forEach(function (rampa) {
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

async function atualizarQuentinhasAtual(dados) {
  const quentinhas = calcularQuentinhas(dados);

  mostrarQuentinhasNaTela(quentinhas);

  try {
    await salvarQuentinhasAtual(quentinhas);
  } catch (erro) {
    console.error("Erro ao atualizar quentinhas na nuvem:", erro);
  }

  return quentinhas;
}

function obterDadosDocumentoAtualQuentinhas() {
  return {
    dataId: obterDataIdLocal(),
    refeicao: identificarRefeicao(),
  };
}

function iniciarObservadorQuentinhas() {
  if (pararObservadorQuentinhas) {
    pararObservadorQuentinhas();
    pararObservadorQuentinhas = null;
  }

  pararObservadorQuentinhas = observarQuentinhasAtual(function (quentinhas) {
    mostrarQuentinhasNaTela(quentinhas);
  }, obterDadosDocumentoAtualQuentinhas());
}

export {
  calcularQuentinhas,
  atualizarQuentinhasAtual,
  iniciarObservadorQuentinhas,
  formatarQuentinhas,
};
