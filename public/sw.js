const CACHE_NAME = "my-cache";
self.addEventListener("install", (e) => {
  console.log("installing service worker...");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache
        .addAll([`/`, `/index.html`, `static/js/bundle.js`])
        .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("activating service worker...");
  event.waitUntil(self.clients.claim());
});
