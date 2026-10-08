/* Tacoma World — service worker
 *
 * Contract (see docs/PRODUCT_CONTRACT.md):
 *   - Caches ONLY the fixed, public application shell.
 *   - NEVER caches the Anthropic API or any cross-origin request.
 *   - NEVER caches user data. Mileage and the service log live in localStorage,
 *     which is not Cache Storage and is never written here.
 *
 * Bump SHELL_VERSION whenever any file in SHELL changes, or phones will keep
 * serving the old build from cache.
 */

const SHELL_VERSION = "tacoma-world-public-shell-v3";

const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/css/tacoma-world.css",
  "/assets/js/app.js",
  "/assets/js/react.min.js",
  "/assets/js/react-dom.min.js",
  "/assets/icons/icon-180.png",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/icons/icon-512-maskable.png",
  "/assets/icons/splash.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_VERSION).then((cache) =>
      Promise.all(
        SHELL.map((url) =>
          // cache: "reload" bypasses stale HTTP cache entries during install,
          // so a new shell version always fetches fresh bytes.
          cache
            .add(new Request(url, { cache: "reload" }))
            .catch((err) => console.warn("[sw] shell miss:", url, err))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("tacoma-world-") && k !== SHELL_VERSION)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin (the Anthropic API, YouTube links) is never intercepted or cached.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Serve instantly from cache, then quietly refresh for the next launch.
        event.waitUntil(
          fetch(request)
            .then((response) => {
              if (response && response.ok && response.type === "basic") {
                return caches.open(SHELL_VERSION).then((c) => c.put(request, response));
              }
            })
            .catch(() => {})
        );
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            const copy = response.clone();
            event.waitUntil(caches.open(SHELL_VERSION).then((c) => c.put(request, copy)));
          }
          return response;
        })
        .catch(() => {
          // Offline navigation falls back to the cached shell.
          if (request.mode === "navigate") return caches.match("/index.html");
          return Response.error();
        });
    })
  );
});
