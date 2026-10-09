// גרסה 98
const CACHE = "komitornut-v98";
const CORE = ["./", "./index.html", "./config.js", "./vendor.js", "./app.js", "./assets.js", "./manifest.json",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-512-maskable.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== "komitornut-ocr").map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return; // e.g. Google Sheets: straight to the network
  if (sameOrigin && url.pathname.includes("/ocr/")) {
    // the screenshot reader is big and never changes: keep it once, across app versions
    e.respondWith(caches.open("komitornut-ocr").then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  const fromCache = () => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
  // no connection at all: answer from the saved copy right away
  if (self.navigator && self.navigator.onLine === false) {
    e.respondWith(fromCache().then((hit) => hit || fetch(req)));
    return;
  }
  // same-origin files are always revalidated with the server, so a new version
  // is picked up right away instead of after the host's 10-minute cache.
  // A connection that hangs falls back to the saved copy after a few seconds.
  const net = sameOrigin ? fetch(req.mode === "navigate" ? url.href : req, { cache: "no-cache" }) : fetch(req);
  net.catch(() => {});
  const fresh = sameOrigin && !url.pathname.endsWith("version.json")
    ? Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), 7000))])
    : net;
  e.respondWith(
    fresh
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => fromCache().then((hit) => hit || net))
  );
});
