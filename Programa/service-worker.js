const CACHE_NAME = "controle-dietas-v1";

const ARQUIVOS_CACHE = [
  "./",
  "./listagem.HTML",
  "./style.CSS",
  "./app.js",
  "./resumo.js",
  "./firebase.js",
  "./quentinhas.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes.map(function (nome) {
          if (nome !== CACHE_NAME) {
            return caches.delete(nome);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (respostaCache) {
      return respostaCache || fetch(event.request);
    })
  );
});
