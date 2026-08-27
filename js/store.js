// 简单 localStorage 工具：把数据存在你自己的浏览器里，绝不上传
const Store = {
  get(key, def) {
    try { const v = localStorage.getItem(key); return v === null ? def : JSON.parse(v); }
    catch (e) { return def; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  },
  remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
};
