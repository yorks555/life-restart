// Service Worker：缓存核心资源，实现离线可用 + 可安装到桌面
const CACHE = 'life-restart-v2';
const ASSETS = [
  'index.html', 'life.html', 'fortune.html', 'bazi.html', 'qian.html',
  'progress.html', 'pixel-town.html', 'privacy.html',
  'css/style.css', 'js/lunar.js', 'js/store.js', 'js/sfx.js', 'js/pwa.js',
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

// 缓存优先，命中直接返回；未命中再请求网络
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
