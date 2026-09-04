// PWA：注入 manifest + 注册 Service Worker（离线 & 可安装到桌面）
// 自动更新：检测到新版 Service Worker 接管页面后自动刷新一次，避免手机一直停留在旧版
(function () {
  // 应用保存的主题（默认浅色；深色时给 <html> 加 data-theme="dark"）
  try {
    if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) {}
  if (!document.querySelector('link[rel="manifest"]')) {
    const l = document.createElement('link');
    l.rel = 'manifest'; l.href = 'manifest.json';
    document.head.appendChild(l);
  }
  if (!('serviceWorker' in navigator)) return;

  // 本页在脚本运行时是否已被旧版 Service Worker 控制。
  // 首次访问（无旧控制器）时不刷新；只有"旧版 → 新版"接管时才刷新一次。
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing || !hadController) return;
    refreshing = true;
    try { showToast('发现新版本，已自动刷新'); } catch (e) {}
    setTimeout(function () { location.reload(); }, 500);
  });

  navigator.serviceWorker.register('sw.js').then(function (reg) {
    // 每次打开页面都主动检查一次 sw.js 是否有新版（不依赖浏览器自身的检查时机）
    if (reg.update) reg.update();
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
  }).catch(function () {});
})();
