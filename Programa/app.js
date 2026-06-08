import { gerarResumo, carregarHistorico } from "./resumo.js";
import {
  atualizarQuentinhasAtual,
  iniciarObservadorQuentinhas,
} from "./quentinhas.js";

const menuScreen = document.getElementById("menu-screen");
const contadoresScreen = document.getElementById("contadores-screen");
const dietasScreen = document.getElementById("dietas-screen");
const especiaisScreen = document.getElementById("especiais-screen");
const resumoScreen = document.getElementById("resumo-screen");
const historicoScreen = document.getElementById("historico-screen");
const visualizarScreen = document.getElementById("visualizar-screen");
const quentinhasScreen = document.getElementById("quentinhas-screen");
const btnMenu = document.getElementById("btnMenu");

const btnVoltarHistorico = document.getElementById("btnVoltarHistorico");

const sopaScreen = document.getElementById("sopa-screen");

const feijaoScreen = document.getElementById("feijao-screen");

const btnNovaEstatistica = document.getElementById("btnNovaEstatistica");

const btnHistorico = document.getElementById("btnHistorico");
const btnQuentinhas = document.getElementById("btnQuentinhas");
const btnFecharQuentinhas = document.getElementById("btnFecharQuentinhas");

btnMenu.addEventListener("click", function () {
  mostrarTela(menuScreen);
});

function esconderTodasAsTelas() {
  menuScreen.classList.add("hidden");

  contadoresScreen.classList.add("hidden");

  dietasScreen.classList.add("hidden");

  especiaisScreen.classList.add("hidden");

  sopaScreen.classList.add("hidden");

  feijaoScreen.classList.add("hidden");

  resumoScreen.classList.add("hidden");

  historicoScreen.classList.add("hidden");

  visualizarScreen.classList.add("hidden");

  quentinhasScreen.classList.add("hidden");
}

btnNovaEstatistica.addEventListener("click", function () {
  mostrarTela(contadoresScreen);
});

btnHistorico.addEventListener("click", function () {
  carregarHistorico();

  mostrarTela(historicoScreen);
});

btnQuentinhas.addEventListener("click", function () {
  iniciarObservadorQuentinhas();

  mostrarTela(quentinhasScreen);
});

btnFecharQuentinhas.addEventListener("click", function () {
  mostrarTela(menuScreen);
});

let pure = 0;
let ptn = 0;
let macarrao = 0;

const menosPure = document.getElementById("menosPure");
const maisPure = document.getElementById("maisPure");
const valorPure = document.getElementById("valorPure");

const menosPtn = document.getElementById("menosPtn");
const maisPtn = document.getElementById("maisPtn");
const valorPtn = document.getElementById("valorPtn");

const menosMacarrao = document.getElementById("menosMacarrao");
const maisMacarrao = document.getElementById("maisMacarrao");
const valorMacarrao = document.getElementById("valorMacarrao");

function atualizarContadores() {
  valorPure.textContent = pure;
  valorPtn.textContent = ptn;
  valorMacarrao.textContent = macarrao;
}

maisPure.addEventListener("click", function () {
  pure++;

  atualizarContadores();
});

menosPure.addEventListener("click", function () {
  if (pure > 0) {
    pure--;

    atualizarContadores();
  }
});

maisMacarrao.addEventListener("click", function () {
  macarrao++;

  atualizarContadores();
});

menosMacarrao.addEventListener("click", function () {
  if (macarrao > 0) {
    macarrao--;

    atualizarContadores();
  }
});

maisPtn.addEventListener("click", function () {
  ptn++;

  atualizarContadores();
});

menosPtn.addEventListener("click", function () {
  if (ptn > 0) {
    ptn--;

    atualizarContadores();
  }
});

atualizarContadores();

// Dietas

const dietasGrandes = [
  "Normal",
  "Normal Sem Sal",

  "Acompanhante",

  "Hipolipídica",
  "Hipolipídica Sem Sal",

  "DB",
  "DB Sem Sal",

  "Neutropênica",
  "Neutropênica Sem Sal",

  "Neutropênica DB",
  "Neutropênica DB Sem Sal",

  "60g",
  "60g Sem Sal",

  "60g DB",
  "60g DB Sem Sal",

  "Celíaca",
  "Celíaca Sem Sal",

  "Celíaca DB",
  "Celíaca DB Sem Sal",

  "Pastosa",
  "Pastosa Sem Sal",

  "Pastosa DB",
  "Pastosa DB Sem Sal",

  "Pastosa Homogênea",

  "Sem Resíduo",

  "Pastosa Sem Resíduo",

  "Hipocaliêmica (2,5K)",

  "Pastosa Hipocaliêmica(2,5k)",
];

const dietasPequenas = [
  "Normal",
  "Normal Sem Sal",

  "Hipolipídica",
  "Hipolipídica Sem Sal",

  "DB",
  "DB Sem Sal",

  "Neutropênica",
  "Neutropênica Sem Sal",

  "Neutropênica DB",
  "Neutropênica DB Sem Sal",

  "60g",
  "60g Sem Sal",

  "60g DB",
  "60g DB Sem Sal",

  "Celíaca",
  "Celíaca Sem Sal",

  "Celíaca DB",
  "Celíaca DB Sem Sal",

  "Pastosa",
  "Pastosa Sem Sal",

  "Pastosa DB",
  "Pastosa DB Sem Sal",

  "Pastosa Homogênea",

  "Sem Resíduo",

  "Pastosa Sem Resíduo",

  "Hipocaliêmica (2,5K)",

  "Pastosa Hipocaliêmica(2,5k)",
];

let indiceDieta = 0;

let etapaAtual = "grandes";

const respostasGrandes = {};

const respostasPequenas = {};

const btnIniciarDietas = document.getElementById("btnIniciarDietas");

const nomeDieta = document.getElementById("nomeDieta");

const valorDieta = document.getElementById("valorDieta");

const progresso = document.getElementById("progresso");

const tipoEtapa = document.getElementById("tipoEtapa");

const btnProximo = document.getElementById("btnProximo");

const btnVoltar = document.getElementById("btnVoltar");

valorDieta.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    btnProximo.click();
  }
});

// Mostrando dieta por dieta

function mostrarDieta() {
  const listaAtual = etapaAtual === "grandes" ? dietasGrandes : dietasPequenas;

  const respostasAtuais =
    etapaAtual === "grandes" ? respostasGrandes : respostasPequenas;

  nomeDieta.textContent = listaAtual[indiceDieta];

  progresso.textContent = `Dieta ${indiceDieta + 1} de ${listaAtual.length}`;

  const dietaAtual = listaAtual[indiceDieta];

  if (respostasAtuais[dietaAtual] !== undefined) {
    valorDieta.value = respostasAtuais[dietaAtual];
  } else {
    valorDieta.value = 0;
  }

  valorDieta.focus();
  valorDieta.select();
}

btnIniciarDietas.addEventListener("click", function () {
  etapaAtual = "grandes";

  indiceDieta = 0;

  tipoEtapa.textContent = "DIETAS GRANDES (G)";

  mostrarDieta();

  mostrarTela(dietasScreen);
});


function obterDadosAtuaisEstatistica() {
  return {
    pure,
    ptn,
    macarrao,
    respostasGrandes,
    respostasPequenas,
    respostasEspeciais,
    sopa,
    feijao,
  };
}

function atualizarQuentinhasDoFormulario() {
  atualizarQuentinhasAtual(obterDadosAtuaisEstatistica());
}

btnProximo.addEventListener("click", function () {
  const listaAtual = etapaAtual === "grandes" ? dietasGrandes : dietasPequenas;

  const respostasAtuais =
    etapaAtual === "grandes" ? respostasGrandes : respostasPequenas;

  const dietaAtual = listaAtual[indiceDieta];

  respostasAtuais[dietaAtual] = Number(valorDieta.value);

  atualizarQuentinhasDoFormulario();

  console.log("Grandes:", respostasGrandes);
  console.log("Pequenas:", respostasPequenas);


  indiceDieta++;

  if (indiceDieta < listaAtual.length) {
    mostrarDieta();
  } else if (etapaAtual === "grandes") {
    etapaAtual = "pequenas";

    indiceDieta = 0;

    tipoEtapa.textContent = "MEIAS PORÇÕES (P)";

    mostrarDieta();
  } else {
    indiceEspecial = 0;

    mostrarEspecial();

    mostrarTela(especiaisScreen);
  }
});

btnVoltar.addEventListener("click", function () {
  if (indiceDieta > 0) {
    indiceDieta--;

    mostrarDieta();
  } else if (etapaAtual === "pequenas") {
    etapaAtual = "grandes";

    indiceDieta = dietasGrandes.length - 1;

    tipoEtapa.textContent = "DIETAS GRANDES (G)";

    mostrarDieta();
  } else {
    mostrarTela(contadoresScreen);
  }
});

const dietasEspeciais = ["PED", "PSIQUIATRIA"];

let indiceEspecial = 0;

const respostasEspeciais = {
  PED: {
    G: 0,
    P: 0,
  },

  PSIQUIATRIA: {
    G: 0,
    P: 0,
  },
};

const nomeEspecial = document.getElementById("nomeEspecial");

const valorEspecialG = document.getElementById("valorEspecialG");

const valorEspecialP = document.getElementById("valorEspecialP");

const btnEspecialVoltar = document.getElementById("btnEspecialVoltar");

const btnEspecialProximo = document.getElementById("btnEspecialProximo");

function mostrarEspecial() {
  const especial = dietasEspeciais[indiceEspecial];

  nomeEspecial.textContent = especial;

  valorEspecialG.value = respostasEspeciais[especial].G;

  valorEspecialP.value = respostasEspeciais[especial].P;

  valorEspecialG.focus();
  valorEspecialG.select();
}

btnEspecialProximo.addEventListener("click", function () {
  const especial = dietasEspeciais[indiceEspecial];

  respostasEspeciais[especial].G = Number(valorEspecialG.value);

  respostasEspeciais[especial].P = Number(valorEspecialP.value);

  atualizarQuentinhasDoFormulario();

  indiceEspecial++;

  if (indiceEspecial < dietasEspeciais.length) {
    mostrarEspecial();
  } else {
    console.log("Grandes:", respostasGrandes);
    console.log("Pequenas:", respostasPequenas);
    console.log("Especiais:", respostasEspeciais);

    sopaPedaco.value = sopa.pedaco;
    sopaBatida.value = sopa.batida;

    mostrarTela(sopaScreen);

    sopaPedaco.focus();
    sopaPedaco.select();
  }
});

function voltarEspecial() {
  if (indiceEspecial > 0) {
    indiceEspecial--;
    mostrarEspecial();
    return;
  }

  etapaAtual = "pequenas";
  indiceDieta = dietasPequenas.length - 1;
  tipoEtapa.textContent = "MEIAS PORÇÕES (P)";

  mostrarDieta();
  mostrarTela(dietasScreen);
}

btnEspecialVoltar.addEventListener("pointerdown", function (event) {
  event.preventDefault();
  voltarEspecial();
});

const sopa = {
  pedaco: 0,
  batida: 0,
};

const sopaPedaco = document.getElementById("sopaPedaco");
const sopaBatida = document.getElementById("sopaBatida");

const btnSopaVoltar = document.getElementById("btnSopaVoltar");
const btnSopaProximo = document.getElementById("btnSopaProximo");

const feijaoLiquidificado = document.getElementById("feijaoLiquidificado");

const feijaoCaldo = document.getElementById("feijaoCaldo");

const feijaoBatido = document.getElementById("feijaoBatido");

const feijaoCaroco = document.getElementById("feijaoCaroco");

const feijaoNoCopo = document.getElementById("feijaoNoCopo");

const btnFeijaoVoltar = document.getElementById("btnFeijaoVoltar");

const btnFeijaoProximo = document.getElementById("btnFeijaoProximo");

const feijao = {
  liquidificado: 0,
  caldo: 0,
  batido: 0,
  caroco: 0,
  noCopo: 0,
};

function obterDadosAtuais() {
  return {
    pure,
    ptn,
    macarrao,
    respostasGrandes,
    respostasPequenas,
    respostasEspeciais,
    sopa,
    feijao,
  };
}


btnSopaProximo.addEventListener("click", function () {
  sopa.pedaco = Number(sopaPedaco.value);
  sopa.batida = Number(sopaBatida.value);

  feijaoLiquidificado.focus();

  mostrarTela(feijaoScreen);
});

btnSopaVoltar.addEventListener("click", function () {
  mostrarTela(especiaisScreen);

  valorEspecialG.focus();
  valorEspecialG.select();
});

btnFeijaoProximo.addEventListener("click", function () {
  feijao.liquidificado = Number(feijaoLiquidificado.value);

  feijao.caldo = Number(feijaoCaldo.value);

  feijao.batido = Number(feijaoBatido.value);

  feijao.caroco = Number(feijaoCaroco.value);

  feijao.noCopo = Number(feijaoNoCopo.value);

  console.log("Feijão:", feijao);

  atualizarQuentinhasDoFormulario();

  gerarResumo(obterDadosAtuaisEstatistica());

  mostrarTela(resumoScreen);
});

btnFeijaoVoltar.addEventListener("click", function () {
  mostrarTela(sopaScreen);

  sopaPedaco.focus();
  sopaPedaco.select();
});

window.abrirTelaHistorico = function () {
  mostrarTela(historicoScreen);
};

window.abrirTelaVisualizar = function () {
  mostrarTela(visualizarScreen);
};

window.abrirTelaMenu = function () {
  mostrarTela(menuScreen);
};

window.abrirTelaQuentinhas = function () {
  mostrarTela(quentinhasScreen);
};

function mostrarTela(tela) {
  esconderTodasAsTelas();
  tela.classList.remove("hidden");
}

btnVoltarHistorico.addEventListener("click", function () {
  carregarHistorico();
  mostrarTela(historicoScreen);
});

valorDieta.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

valorEspecialG.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

valorEspecialP.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

sopaPedaco.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

sopaBatida.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

feijaoLiquidificado.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

feijaoCaldo.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

feijaoBatido.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

feijaoCaroco.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});

feijaoNoCopo.addEventListener("focus", function () {
  if (this.value === "0") {
    this.value = "";
  }
});
