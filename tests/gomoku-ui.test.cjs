const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const Gomoku = require('../js/gomoku-engine.js');
const source = fs.readFileSync(path.join(__dirname, '../js/gomoku.js'), 'utf8');
const page = fs.readFileSync(path.join(__dirname, '../gomoku.html'), 'utf8');

// Minimal event/DOM fixture exercises the real page controller without a browser dependency.
function boot(saved = {}) {
  class Element {
    constructor() { this.children = []; this.listeners = {}; this.attributes = {}; this.classList = { toggle() {} }; }
    appendChild(child) { this.children.push(child); }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(event, fn) { (this.listeners[event] ||= []).push(fn); }
    emit(event, data = {}) { for (const fn of this.listeners[event] || []) fn(data); }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
    focus() {}
  }
  const elements = Object.fromEntries([...page.matchAll(/id="([^"]+)"/g)].map(m => [m[1], new Element()]));
  const timers = new Map(); let seq = 0, data = structuredClone(saved);
  const context = vm.createContext({
    Gomoku, document: { getElementById: id => elements[id], createElement: () => new Element() },
    Store: { get: () => structuredClone(data), set: (key, value) => { data = structuredClone(value); } },
    showToast() {}, playSfx() {}, setTimeout: fn => { timers.set(++seq,fn); return seq; }, clearTimeout: id => timers.delete(id)
  });
  vm.runInContext(source, context);
  return { elements, timers, data: () => data, place(r,c) { elements.board.children[r*15+c].emit('click'); elements.place.emit('click'); } };
}
test('winning move records once, unlocks achievements and survives refresh', () => {
  const saved = {stats:{wins:2,streak:2,bestStreak:2},session:{mode:'ai',difficulty:'hard',moves:[[0,0],[14,0],[0,1],[14,2],[0,2],[14,4],[0,3],[14,6]]}};
  const ui = boot(saved); ui.place(0,4);
  assert.equal(ui.elements.status.textContent,'黑棋获胜');
  assert.equal(ui.data().stats.wins,3);
  assert.deepEqual(Gomoku.unlocked(ui.data().stats),['first','streak','hard']);
  ui.elements.place.emit('click'); ui.elements.undo.emit('click');
  assert.equal(ui.data().stats.wins,3);
  const resumed = boot(ui.data());
  assert.equal(resumed.elements.status.textContent,'黑棋获胜');
  assert.equal(resumed.data().stats.wins,3);
  assert.equal(resumed.timers.size,0);
});
test('undo while AI thinks cancels even a stale response', () => {
  const ui = boot(); ui.place(7,7);
  const staleResponse = [...ui.timers.values()][0];
  ui.elements.undo.emit('click'); staleResponse();
  assert.equal(ui.timers.size,0);
  assert.equal(ui.data().session.moves.length,0);
  assert.equal(ui.elements.status.textContent,'轮到你了 · 黑棋');
});
test('switch cancellation keeps position; confirmation resets and interrupts streak', () => {
  const ui = boot({stats:{wins:2,streak:2,bestStreak:2}}); ui.place(7,7);
  ui.elements.mode.value='local'; ui.elements.mode.emit('change');
  ui.elements.cancelRestart.emit('click');
  assert.equal(ui.elements.mode.value,'ai'); assert.equal(ui.data().session.moves.length,1);
  const staleResponse = [...ui.timers.values()][0];
  ui.elements.mode.value='local'; ui.elements.mode.emit('change'); ui.elements.confirmRestart.emit('click');
  staleResponse();
  assert.equal(ui.data().session.mode,'local'); assert.equal(ui.data().session.moves.length,0);
  assert.equal(ui.data().stats.streak,0); assert.equal(ui.data().stats.wins,2);
});
test('local win does not alter human-vs-AI records', () => {
  const ui=boot({stats:{wins:2,streak:2,bestStreak:2},session:{mode:'local',moves:[]}});
  for(const [r,c] of [[0,0],[14,0],[0,1],[14,2],[0,2],[14,4],[0,3],[14,6],[0,4]]) ui.place(r,c);
  assert.equal(ui.elements.status.textContent,'黑棋获胜');
  assert.equal(ui.data().stats.wins,2); assert.equal(ui.data().stats.streak,2);
});
