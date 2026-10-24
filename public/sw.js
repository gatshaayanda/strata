const CACHE_VERSION = "strata-shell-v4";
const SHELL_CACHE = CACHE_VERSION;
const STATIC_LIMIT = 100;
const APP_SHELL = [
  "/",
  "/order",
  "/manifest.webmanifest",
  "/stratalogo.jpeg",
  "/strata-brand-logo.svg",
  "/strata-assets/fish.jpeg",
  "/strata-assets/groupline.jpeg",
  "/strata-assets/groupline1.jpeg",
  "/strata-assets/customer.jpeg",
  "/strata-assets/customers.jpeg",
  "/strata-assets/stat.mp4"
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
  const isPrivate = /^\/(?:account|requests|orders|admin|operations|invite|request|book|saved)(?:\/|$)/.test(url.pathname);

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

  if (request.headers.has("range") && /\.mp4$/i.test(url.pathname)) {
    event.respondWith(handleVideoRange(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|avif|mp4)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

async function handleVideoRange(request) {
  const cache = await caches.open(SHELL_CACHE);
  const url = new URL(request.url);
  const cached = await cache.match(url.pathname + url.search);
  if (cached) return createRangeResponse(cached, request.headers.get("range"));
  try {
    return await fetch(request);
  } catch {
    return Response.error();
  }
}

async function createRangeResponse(response, rangeHeader) {
  if (!rangeHeader || !rangeHeader.startsWith("bytes=")) return response;
  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;
  const [startText, endText] = rangeHeader.slice(6).split("-", 2);
  let start = startText ? Number.parseInt(startText, 10) : 0;
  let end = endText ? Number.parseInt(endText, 10) : size - 1;
  if (!startText && endText) {
    start = Math.max(0, size - Number.parseInt(endText, 10));
    end = size - 1;
  }
  end = Math.min(end, size - 1);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(buffer.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers });
}

async function cacheFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    // Cache only complete successful responses, never partial byte-range responses.
    if (response.ok && response.status === 200 && !request.headers.has("range")) {
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
