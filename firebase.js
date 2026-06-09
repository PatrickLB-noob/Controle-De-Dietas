import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCopNhY8KFfJ6VVhOOotlVJ85GavpHC_GU",
  authDomain: "estatistica-de-dietaph.firebaseapp.com",
  projectId: "estatistica-de-dietaph",
  storageBucket: "estatistica-de-dietaph.firebasestorage.app",
  messagingSenderId: "476079925649",
  appId: "1:476079925649:web:4aa724c323ffe67ae25230",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase conectado!");

async function salvarNaNuvem(estatistica) {
  const docRef = await addDoc(collection(db, "estatisticas"), estatistica);

  console.log("Salvo no Firebase:", docRef.id);

  return docRef.id;
}

async function buscarEstatisticasNaNuvem() {
  const querySnapshot = await getDocs(collection(db, "estatisticas"));

  const estatisticas = [];

  querySnapshot.forEach(function (documento) {
    estatisticas.push({
      id: documento.id,
      ...documento.data(),
    });
  });

  return estatisticas;
}

async function excluirEstatisticaNaNuvem(id) {
  await deleteDoc(doc(db, "estatisticas", id));

  console.log("Estatística excluída da nuvem:", id);
}

function normalizarTextoParaId(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function obterIdDocumentoQuentinhas(quentinhas) {
  if (quentinhas?.id) {
    return quentinhas.id;
  }

  const dataId = quentinhas?.dataId || new Date().toISOString().slice(0, 10);
  const refeicaoId = normalizarTextoParaId(quentinhas?.refeicao || "outra");

  return `${dataId}_${refeicaoId}`;
}

function obterIdFinalizado(quentinhas) {
  if (quentinhas?.idFinalizado) {
    return quentinhas.idFinalizado;
  }

  const base = obterIdDocumentoQuentinhas(quentinhas);
  const horarioId = quentinhas?.horarioFinalizacaoId || quentinhas?.horarioId || String(Date.now());

  return `${base}_${horarioId}`;
}

async function salvarQuentinhasEmAndamento(quentinhas) {
  const idDocumento = obterIdDocumentoQuentinhas(quentinhas);

  await setDoc(
    doc(db, "quentinhasEmAndamento", idDocumento),
    {
      ...quentinhas,
      id: idDocumento,
      status: "em_andamento",
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  );

  console.log("Quentinhas em andamento atualizadas:", idDocumento);

  return idDocumento;
}

async function buscarQuentinhasEmAndamento() {
  const querySnapshot = await getDocs(collection(db, "quentinhasEmAndamento"));

  const quentinhas = [];

  querySnapshot.forEach(function (documento) {
    quentinhas.push({
      id: documento.id,
      status: "em_andamento",
      ...documento.data(),
    });
  });

  return quentinhas;
}

function observarQuentinhasEmAndamentoPorId(idDocumento, callback) {
  return onSnapshot(
    doc(db, "quentinhasEmAndamento", idDocumento),
    function (documento) {
      if (documento.exists()) {
        callback({
          id: documento.id,
          status: "em_andamento",
          ...documento.data(),
        });
      } else {
        callback(null);
      }
    },
    function (erro) {
      console.error("Erro ao observar quentinhas em andamento:", erro);
      callback(null);
    }
  );
}

async function excluirQuentinhaEmAndamento(id) {
  await deleteDoc(doc(db, "quentinhasEmAndamento", id));
}

async function salvarQuentinhaFinalizada(quentinhas) {
  const idDocumento = obterIdFinalizado(quentinhas);

  await setDoc(
    doc(db, "quentinhasFinalizadas", idDocumento),
    {
      ...quentinhas,
      id: idDocumento,
      idOrigem: quentinhas.id || obterIdDocumentoQuentinhas(quentinhas),
      status: "finalizada",
      finalizadaEm: serverTimestamp(),
    },
    { merge: true }
  );

  console.log("Quentinha finalizada salva:", idDocumento);

  return idDocumento;
}

async function buscarQuentinhasFinalizadas() {
  const querySnapshot = await getDocs(collection(db, "quentinhasFinalizadas"));

  const quentinhas = [];

  querySnapshot.forEach(function (documento) {
    quentinhas.push({
      id: documento.id,
      status: "finalizada",
      ...documento.data(),
    });
  });

  return quentinhas;
}

function observarQuentinhaFinalizadaPorId(idDocumento, callback) {
  return onSnapshot(
    doc(db, "quentinhasFinalizadas", idDocumento),
    function (documento) {
      if (documento.exists()) {
        callback({
          id: documento.id,
          status: "finalizada",
          ...documento.data(),
        });
      } else {
        callback(null);
      }
    },
    function (erro) {
      console.error("Erro ao observar quentinha finalizada:", erro);
      callback(null);
    }
  );
}

async function excluirQuentinhaFinalizada(id) {
  await deleteDoc(doc(db, "quentinhasFinalizadas", id));
}

// Compatibilidade com versões anteriores do app.
async function salvarQuentinhasAtual(quentinhas) {
  return salvarQuentinhasEmAndamento(quentinhas);
}

async function buscarQuentinhasNaNuvem() {
  const [emAndamento, finalizadas] = await Promise.all([
    buscarQuentinhasEmAndamento(),
    buscarQuentinhasFinalizadas(),
  ]);

  return [...emAndamento, ...finalizadas];
}

function observarQuentinhasPorId(idDocumento, callback, status = "em_andamento") {
  if (status === "finalizada") {
    return observarQuentinhaFinalizadaPorId(idDocumento, callback);
  }

  return observarQuentinhasEmAndamentoPorId(idDocumento, callback);
}

async function excluirQuentinhaNaNuvem(id, status = "em_andamento") {
  if (status === "finalizada") {
    return excluirQuentinhaFinalizada(id);
  }

  return excluirQuentinhaEmAndamento(id);
}

function observarQuentinhasAtual(callback, dadosBase = {}) {
  const idDocumento = obterIdDocumentoQuentinhas(dadosBase);

  return observarQuentinhasEmAndamentoPorId(idDocumento, callback);
}

export {
  salvarNaNuvem,
  buscarEstatisticasNaNuvem,
  excluirEstatisticaNaNuvem,
  salvarQuentinhasAtual,
  salvarQuentinhasEmAndamento,
  buscarQuentinhasNaNuvem,
  buscarQuentinhasEmAndamento,
  buscarQuentinhasFinalizadas,
  observarQuentinhasAtual,
  observarQuentinhasPorId,
  observarQuentinhasEmAndamentoPorId,
  observarQuentinhaFinalizadaPorId,
  excluirQuentinhaNaNuvem,
  excluirQuentinhaEmAndamento,
  excluirQuentinhaFinalizada,
  salvarQuentinhaFinalizada,
};
