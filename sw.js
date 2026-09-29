// Minimal app-shell cache so the site qualifies as an installable PWA
// and loads instantly on repeat visits. Booking data always comes
// fresh from Supabase; this only caches the static shell.
const CACHE = "bookit-shell-v1";
const SHELL = [
  "./index.html",
  "./login.html",
  "./dashboard.html",
  "./book.html",
  "./manage.html",
  "./style.css",
  "./config.js",
  "./theme.js",
  "./favicon.svg",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigations (so logged-in users always see fresh data
// when online), falling back to the cached shell when offline.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((res) => res || caches.match("./index.html")))
  );
});
