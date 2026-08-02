// Service Worker mínimo — cobre o pré-requisito técnico para o
// navegador oferecer "Instalar app", e dá uma tela de fallback simples
// se o usuário abrir o app sem internet. Não é um cache offline
// completo (isso exigiria estratégia de cache por rota, mais complexo)
// — decisão de escopo desta entrega, documentada no relatório.

const CACHE_NAME = "sga-shell-v1";
const SHELL_URLS = ["/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Estratégia network-first: sempre tenta buscar da internet primeiro
  // (dados sempre atualizados); só usa o cache se estiver offline.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
