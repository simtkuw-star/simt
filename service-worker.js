const SIMT_CACHE = "simt-app-v1";
const SIMT_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/logo-simt.png",
  "/favicon.ico",
  "/favicon-48.png",
  "/app-icon-192.png",
  "/app-icon-512.png",
  "/simt-knowledge.js",
  "/simt-firebase.js",
  "/firebase-config.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SIMT_CACHE).then((cache) => cache.addAll(SIMT_ASSETS)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== SIMT_CACHE).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(SIMT_CACHE).then((cache) => cache.put(event.request, copy)).catch(() => null);
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html")))
  );
});
