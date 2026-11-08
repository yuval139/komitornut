// גרסה 345 (the new app; generated from web/sw.template.js at build time)
const CACHE = "komitornut-v345";
// the app's scripts and styles have content-hashed names: they are kept as they are fetched
const CORE = ["./", "./index.html", "./manifest.json",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-512-maskable.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k !== "komitornut-ocr" && k !== "komitornut-badge").map((k) => caches.delete(k)))).then(() => self.clients.claim()));
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

/* ---- push notifications (the sender is described in docs/PUSH_HE.md) ---- */
// the number on the app's icon is kept in a cache of its own, so it survives new app versions
const badgeCount = () => caches.open("komitornut-badge").then((c) => c.match("count")).then((r) => (r ? r.text() : "0")).then((t) => parseInt(t, 10) || 0);
const saveBadge = (n) => caches.open("komitornut-badge").then((c) => c.put("count", new Response(String(n))));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { /* a push without readable text still shows something */ }
  e.waitUntil((async () => {
    // a push must always show a notification: phones withdraw the permission from apps that stay silent
    await self.registration.showNotification(d.title || "קוממיות", {
      body: d.body || "יש עדכון חדש", tag: d.tag, dir: "rtl", lang: "he",
      icon: "./icons/icon-192.png", badge: "./icons/icon-192.png", data: { url: d.url || "./" },
    });
    const n = (await badgeCount()) + 1;
    await saveBadge(n);
    if (self.navigator && self.navigator.setAppBadge) await self.navigator.setAppBadge(n).catch(() => {});
  })());
});
// the open app tells us the true count (what the bell shows)
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "badge") e.waitUntil(saveBadge(Math.max(0, parseInt(e.data.count, 10) || 0)));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  const go = (/[?&]go=([a-z]+)/.exec(url) || [])[1] || "notices";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
    const open = all.find((c) => "focus" in c);
    // an app that is already open is told where to go; a shut one opens straight there (?go=)
    if (open) { open.postMessage({ type: "push-go", go }); return open.focus(); }
    return self.clients.openWindow(url);
  }));
});
