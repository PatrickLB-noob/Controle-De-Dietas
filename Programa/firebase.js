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

async function salvarQuentinhasAtual(quentinhas) {
  await setDoc(
    doc(db, "quentinhasAtuais", "ultima"),
    {
      ...quentinhas,
      atualizadoEm: serverTimestamp(),
    }
  );

  console.log("Quentinhas atualizadas na nuvem");
}

function observarQuentinhasAtual(callback) {
  return onSnapshot(
    doc(db, "quentinhasAtuais", "ultima"),
    function (documento) {
      if (documento.exists()) {
        callback(documento.data());
      } else {
        callback(null);
      }
    },
    function (erro) {
      console.error("Erro ao observar quentinhas:", erro);
      callback(null);
    }
  );
}

export {
  salvarNaNuvem,
  buscarEstatisticasNaNuvem,
  excluirEstatisticaNaNuvem,
  salvarQuentinhasAtual,
  observarQuentinhasAtual,
};
