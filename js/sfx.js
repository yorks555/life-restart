// 轻量音效 + 振动反馈（纯 WebAudio，无音频文件）
let __sfxCtx = null;

function playSfx(type) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      if (!__sfxCtx) __sfxCtx = new Ctx();
      if (__sfxCtx.state === 'suspended') __sfxCtx.resume();
      const t = __sfxCtx.currentTime;
      const osc = __sfxCtx.createOscillator();
      const gain = __sfxCtx.createGain();
      osc.connect(gain); gain.connect(__sfxCtx.destination);
      const dur = 0.14;
      const isGood = type === 'good';
      osc.type = isGood ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(isGood ? 880 : 420, t);
      if (isGood) osc.frequency.exponentialRampToValueAtTime(1320, t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t); osc.stop(t + dur);
    }
  } catch (e) {}
  // 移动端振动：成功更轻快
  if (navigator.vibrate) navigator.vibrate(type === 'good' ? 25 : 12);
}
