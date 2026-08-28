// Service Worker：缓存核心资源，实现离线可用 + 可安装到桌面
const CACHE = 'life-restart-v3';
const ASSETS = [
  'index.html', 'life.html', 'fortune.html', 'bazi.html', 'qian.html',
  'progress.html', 'pixel-town.html', 'privacy.html',
  'css/style.css', 'js/lunar.js', 'js/store.js', 'js/sfx.js', 'js/pwa.js', 'js/ui.js',
  'favicon.svg', 'manifest.json', 'icon-192.png', 'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// 网络优先：在线时永远取最新；离线时回退到缓存（这样更新后手机能看到新版）
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
