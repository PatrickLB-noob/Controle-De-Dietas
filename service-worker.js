const CACHE_NAME = "dietas-v7";

const ARQUIVOS_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./resumo.js",
  "./firebase.js",
  "./quentinhas.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (event) {
  self.skipWaiting();

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
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(function (respostaRede) {
        const copia = respostaRede.clone();

        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, copia);
        });

        return respostaRede;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
