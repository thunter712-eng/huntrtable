/**
 * HuntrTable service worker.
 *
 * Strategy:
 *  - Precache the app shell on install.
 *  - Navigations: network-first, falling back to the cached shell offline.
 *  - Other GETs (JS/CSS/fonts/icons): stale-while-revalidate.
 *
 * Because all questions ship in the JS bundle, the game works fully offline
 * once installed.
 *
 * Paths are resolved relative to the worker's own location so this works both
 * at the site root and under a sub-path like GitHub Pages' /huntrtable/.
 */
const CACHE = "huntrtable-v2";
// e.g. "/" locally, "/huntrtable/" on GitHub Pages.
const BASE = new URL("./", self.location).pathname;
const SHELL = [BASE, `${BASE}manifest.json`, `${BASE}icons/icon-192.png`];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // App navigations: try the network, fall back to the cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(BASE, copy));
          return res;
        })
        .catch(() => caches.match(BASE).then((r) => r || caches.match(request))),
    );
    return;
  }

  // Static assets: serve cached immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
