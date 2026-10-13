const CACHE_VERSION = "strata-shell-v1";
const SHELL_CACHE = CACHE_VERSION;
const STATIC_LIMIT = 100;
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/strata-icon.svg",
  "/strata-assets/fish.jpeg",
  "/strata-assets/groupline.jpeg",
  "/strata-assets/groupline1.jpeg",
  "/strata-assets/customer.jpeg",
  "/strata-assets/customers.jpeg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await Promise.all(APP_SHELL.map(async path => {
      try {
        const response = await fetch(new Request(path, { cache: "reload" }));
        if (response.ok) await cache.put(path, response);
      } catch {
        // A failed optional asset must not prevent the service worker from installing.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("strata-shell-") && key !== SHELL_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  const isNavigation = request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
  const isPrivate = /^\/(?:account|requests|orders|admin|invite|request|order|book|saved)(?:\/|$)/.test(url.pathname);

  // Never cache customer or admin records. A connection is required for private actions.
  if (isPrivate) return;

  if (isNavigation) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) void caches.open(SHELL_CACHE).then(async cache => {
        await cache.put(request, response.clone());
        await trimCache(SHELL_CACHE, STATIC_LIMIT);
      });
      return response;
    }).catch(async () => {
      const cache = await caches.open(SHELL_CACHE);
      return (await cache.match(request)) || (await cache.match("/")) || Response.error();
    }));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|avif|mp4)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await trimCache(SHELL_CACHE, STATIC_LIMIT);
    }
    return response;
  } catch {
    return Response.error();
  }
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) await Promise.all(keys.slice(0, keys.length - maxEntries).map(request => cache.delete(request)));
}
