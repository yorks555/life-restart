// PWA：注入 manifest + 注册 Service Worker（离线 & 可安装到桌面）
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
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
