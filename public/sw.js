// Service worker: lets the app open offline after one online visit.
// - Same-origin app shell + /assets/*: cached; navigations are network-first (so a new
//   deploy is picked up as soon as the device is online) and fall back to the cache.
// - /api/* is never cached: triage chat must hit the network (the app has its own
//   offline fallback text).
// - Google Fonts: stale-while-revalidate so the typography matches offline too.
const SHELL_CACHE = 'calc-shell-v1';
const FONT_CACHE = 'calc-fonts-v1';

const assetUrlsFrom = (html) => {
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]+\.(?:js|css|png|webmanifest))"/g)) urls.add(m[1]);
  return [...urls];
};

const cacheShell = async (html) => {
  const cache = await caches.open(SHELL_CACHE);
  const wanted = assetUrlsFrom(html);
  await cache.put('/', new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
  await Promise.all(
    wanted.map(async (u) => {
      if (!(await cache.match(u))) await cache.add(u).catch(() => {});
    })
  );
  // Drop hashed bundles from earlier deploys that the new index no longer references.
  for (const req of await cache.keys()) {
    const p = new URL(req.url).pathname;
    if (p.startsWith('/assets/') && !wanted.includes(p)) await cache.delete(req);
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch('/', { cache: 'reload' })
      .then((r) => r.text())
      .then(cacheShell)
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n.startsWith('calc-') && ![SHELL_CACHE, FONT_CACHE].includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fresh = fetch(req).then((res) => {
          if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
          return res;
        });
        return cached || fresh.catch(() => Response.error());
      })
    );
    return;
  }

  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) res.clone().text().then(cacheShell).catch(() => {});
          return res;
        })
        .catch(async () => (await caches.match('/')) || Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok && url.pathname.startsWith('/assets/')) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
