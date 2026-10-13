importScripts(
  "https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js",
  "/api/firebase/messaging-sw-config"
);

let thePlugMessaging = null;
try {
  const config = self.__STRATA_FIREBASE_CONFIG__;
  if (config && config.apiKey && config.projectId && config.messagingSenderId && config.appId) {
    firebase.initializeApp(config);
    thePlugMessaging = firebase.messaging();
    thePlugMessaging.onBackgroundMessage((payload) => {
      // Notification payloads are displayed automatically by Firebase. Only render
      // data-only pushes here to avoid showing the same notification twice.
      if (payload.notification) return;
      const title = payload.data?.title || "Strata Sa’o Bitsa update";
      const options = {
        body: payload.data?.body || "Open Strata Sa’o Bitsa to check your latest account information.",
        icon: "/strata-icon.svg",
        badge: "/strata-icon.svg",
        data: { link: payload.data?.link || "/my-orders" },
      };
      self.registration.showNotification(title, options);
    });
  } else {
    console.error("Strata Sa’o Bitsa Firebase Messaging web config is incomplete.");
  }
} catch (error) {
  console.error("Strata Sa’o Bitsa Firebase Messaging service worker could not initialize.", error);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawLink = event.notification.data?.link || "/my-orders";
  const link = rawLink.startsWith("/") ? rawLink : "/my-orders";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) {
      if ("focus" in client) {
        void client.navigate(link);
        return client.focus();
      }
    }
    return clients.openWindow(link);
  }));
});

const CACHE_VERSION = "strata-shell-v1";
const MEDIA_CACHE = "strata-media-v1";
const SHELL_CACHE = CACHE_VERSION;
const STATIC_LIMIT = 100;
const PUBLIC_PAGE_LIMIT = 12;
const APP_SHELL = ["/", "/offline", "/strata-icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    await precacheShell();
    // Install the new routing/cache policy immediately; the page is not force-reloaded.
    await self.skipWaiting();
  })());
});

async function precacheShell() {
  const shell = await caches.open(SHELL_CACHE);
  const discovered = new Set();
  for (const path of APP_SHELL) {
    try {
      const request = new Request(path, { cache: "reload" });
      const response = await fetch(request);
      if (!response.ok) continue;
      await shell.put(request, response.clone());
      if (!(response.headers.get("content-type") || "").includes("text/html")) continue;
      const html = await response.text();
      for (const match of html.matchAll(/(?:src|href)=["'](\/_next\/static\/[^"']+)["']/g)) discovered.add(match[1]);
    } catch {}
  }
  await Promise.all([...discovered].map(async path => {
    try {
      const request = new Request(path, { cache: "reload" });
      const response = await fetch(request);
      if (response.ok) await shell.put(request, response);
    } catch {}
  }));
  await trimCache(SHELL_CACHE, STATIC_LIMIT);
}

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => (key.startsWith("strata-shell-") && key !== SHELL_CACHE) || (key.startsWith("strata-media-") && key !== MEDIA_CACHE)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return;

  const isNavigation = request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
  const isPrivate = /^\/(?:account|my-orders|order|requests|orders|admin|invite)(?:\/|$)/.test(url.pathname);

  // Private/member routes are network-only. Never serve a cached account/order page as
  // a substitute for a different route or when the authenticated page cannot be fetched.
  if (isNavigation && isPrivate) {
    event.respondWith(fetch(request).catch(() => caches.open(SHELL_CACHE).then(cache => cache.match("/offline")).then(response => response || Response.error())));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/manifest.webmanifest" || /\.(?:css|js|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|avif)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isNavigation) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) void caches.open(SHELL_CACHE).then(async cache => {
        await cache.put(request, response.clone());
        await trimCache(SHELL_CACHE, PUBLIC_PAGE_LIMIT + STATIC_LIMIT);
      });
      return response;
    }).catch(async () => {
      const cache = await caches.open(SHELL_CACHE);
      return await cache.match(request) || await cache.match("/") || await cache.match("/offline") || Response.error();
    }));
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
      await trimCache(SHELL_CACHE, STATIC_LIMIT + PUBLIC_PAGE_LIMIT);
    }
    return response;
  } catch {
    return Response.error();
  }
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map(request => cache.delete(request)));
}
