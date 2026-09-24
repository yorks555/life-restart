const test = require('node:test');
const assert = require('node:assert/strict');
const { Game, line, choose, stats, record, unlocked } = require('../js/gomoku-engine.js');

test('legal turns, occupied/out-of-range moves and undo preserve state', () => {
  const g = new Game();
  for (const point of [[-1, 0], [15, 1], [1.2, 2], [NaN, 0]]) assert.equal(g.play(...point), false);
  assert.equal(g.play(7, 7), true);
  assert.equal(g.play(7, 7), false);
  assert.equal(g.turn, 2);
  g.play(6, 7); g.undo(2);
  assert.equal(g.turn, 1); assert.equal(g.moves.length, 0); assert.equal(g.board[7][7], 0);
});
for (const [name, points] of [
  ['horizontal edge', [[0,0],[0,1],[0,2],[0,3],[0,4]]],
  ['vertical edge', [[0,14],[1,14],[2,14],[3,14],[4,14]]],
  ['diagonal', [[3,3],[4,4],[5,5],[6,6],[7,7]]],
  ['anti-diagonal', [[0,14],[1,13],[2,12],[3,11],[4,10]]]
]) test(name + ' wins and freezes the result', () => {
  const g = new Game();
  points.forEach((p, i) => { g.play(...p); if (i < 4) g.play(14, i * 2); });
  assert.equal(g.winner, 1); assert.equal(g.winningLine.length, 5);
  assert.equal(g.play(8, 8), false); assert.equal(g.undo(), false);
});
test('freestyle accepts overline and does not wrap at board edges', () => {
  const g = new Game();
  for (let c = 0; c < 6; c++) g.board[0][c] = 2;
  assert.equal(line(g.board, 0, 2).length, 6);
  const edge = new Game();
  for (const [r,c] of [[0,13],[0,14],[1,0],[1,1],[1,2]]) edge.board[r][c] = 1;
  assert.equal(line(edge.board, 1, 0).length, 0);
});
test('full board without a five is a draw', () => {
  const g = new Game(), black = [], white = [];
  for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) ((r + 2*c) % 4 < 2 ? black : white).push([r,c]);
  assert.equal(black.length, 113); assert.equal(white.length, 112);
  for (let i = 0; i < 113; i++) { assert.ok(g.play(...black[i])); if (white[i]) assert.ok(g.play(...white[i])); }
  assert.equal(g.draw, true); assert.equal(g.winner, 0); assert.equal(choose(g.board), null);
});
test('resume rebuilds turns and winners, rejects corrupt histories', () => {
  const g = new Game(); g.play(7,7); g.play(7,8); g.play(6,6);
  assert.deepEqual(Game.restore(g.moves), g);
  for (const moves of [null, {}, [[0,0],[0,0]], [[99,0]], [[1]], [[0,0,1]]]) assert.equal(Game.restore(moves), null);
  const won = [[0,0],[14,0],[0,1],[14,2],[0,2],[14,4],[0,3],[14,6],[0,4]];
  assert.equal(Game.restore(won).winner, 1);
  assert.equal(Game.restore([...won,[10,10]]), null);
});
for (const level of ['easy','hard']) {
  test(level + ' takes its win before defending, without changing the board', () => {
    const g = new Game();
    for (let c = 0; c < 4; c++) { g.board[2][c] = 2; g.board[5][c] = 1; }
    const before = JSON.stringify(g.board);
    assert.deepEqual(choose(g.board, 2, level), [2,4]);
    assert.equal(JSON.stringify(g.board), before);
  });
  test(level + ' blocks an immediate broken four', () => {
    const g = new Game();
    for (const c of [3,4,6,7]) g.board[7][c] = 1;
    assert.deepEqual(choose(g.board, 2, level), [7,5]);
  });
  test(level + ' chooses a legal opening and does not mutate search positions', () => {
    const g = new Game();
    assert.deepEqual(choose(g.board, 2, level), [7,7]);
    g.play(7,7); g.play(6,7); g.play(8,8);
    const before = JSON.stringify(g.board);
    const [r,c] = choose(g.board, 2, level);
    assert.equal(g.board[r][c], 0); assert.equal(JSON.stringify(g.board), before);
  });
}
test('stats unlock first win, three consecutive wins and challenge win', () => {
  let s = stats();
  s = record(s,1,'easy'); assert.deepEqual(unlocked(s), ['first']);
  s = record(s,1,'easy'); s = record(s,1,'hard');
  assert.deepEqual(unlocked(s), ['first','streak','hard']);
  s = record(s,2,'hard'); assert.equal(s.streak,0); assert.equal(s.bestStreak,3); assert.equal(s.losses,1);
  s = record(s,0,'easy'); assert.equal(s.draws,1); assert.equal(s.wins,3);
  assert.equal(stats({wins:'bad',losses:-4}).wins,0);
});
