(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const KEY = 'gomoku_v1';
  const saved = Store.get(KEY, {}) || {};
  let stats = Gomoku.stats(saved.stats);
  let mode = saved.session?.mode === 'local' ? 'local' : 'ai';
  let difficulty = saved.session?.difficulty === 'hard' ? 'hard' : 'easy';
  let game = Gomoku.Game.restore(saved.session?.moves) || new Gomoku.Game();
  let selected = null, focusIndex = 112, timer = null, generation = 0, pending = null;
  const buttons = [], baseClasses = [];
  const coordinate = (r, c) => String.fromCharCode(65 + c) + (r + 1);
  const thinking = () => mode === 'ai' && game.turn === 2 && !game.over;
  function persist() {
    Store.set(KEY, { stats, session: { mode, difficulty, moves: game.moves } });
  }
  function renderStats() {
    $('chessStats').innerHTML = [['胜局', stats.wins], ['负局', stats.losses], ['平局', stats.draws], ['当前连胜', stats.streak]]
      .map(([label, count]) => '<div><b>' + count + '</b><span>' + label + '</span></div>').join('');
    const unlocked = Gomoku.unlocked(stats);
    $('chessAchievements').innerHTML = '';
    for (const achievement of Gomoku.achievements) {
      const badge = document.createElement('span');
      const own = unlocked.includes(achievement.id);
      badge.className = own ? '' : 'locked';
      badge.textContent = (own ? achievement.icon : '🔒') + ' ' + achievement.name;
      badge.title = achievement.hint;
      $('chessAchievements').appendChild(badge);
    }
  }
  function render() {
    const busy = thinking(), last = game.moves.at(-1);
    const winning = new Set(game.winningLine.map(([r, c]) => r * 15 + c));
    buttons.forEach((button, index) => {
      const r = Math.floor(index / 15), c = index % 15, stone = game.board[r][c];
      const isSelected = selected && selected[0] === r && selected[1] === c;
      button.className = baseClasses[index] + (stone === 1 ? ' black' : stone === 2 ? ' white' : '') +
        (last && last[0] === r && last[1] === c ? ' last' : '') + (isSelected ? ' selected' : '') + (winning.has(index) ? ' winning' : '');
      button.setAttribute('aria-label', coordinate(r, c) + '，' + (stone === 1 ? '黑棋' : stone === 2 ? '白棋' : '空位') + (isSelected ? '，已选中' : '') + (winning.has(index) ? '，获胜连线' : ''));
      button.setAttribute('aria-disabled', String(!!stone || busy || game.over));
      button.tabIndex = index === focusIndex ? 0 : -1;
    });
    $('mode').value = mode;
    $('difficulty').value = difficulty;
    $('difficulty').disabled = mode === 'local';
    $('modeHelp').textContent = mode === 'local' ? '两人共用一块棋盘，黑白轮流；不计入人机战绩。' :
      difficulty === 'hard' ? '挑战：对手会考虑你的下一步反击。你执黑先行。' : '休闲：观察棋形，练习攻防。你执黑先行。';
    $('turnDot').classList.toggle('white', game.turn === 2 && !game.over);
    $('status').textContent = game.winner ? (game.winner === 1 ? '黑棋获胜' : '白棋获胜') : game.draw ? '棋盘已满 · 平局' :
      busy ? '白棋思考中…' : mode === 'ai' ? '轮到你了 · 黑棋' : (game.turn === 1 ? '轮到黑棋' : '轮到白棋');
    $('moveCount').textContent = game.over ? '共 ' + game.moves.length + ' 手' : '第 ' + (game.moves.length + 1) + ' 手';
    $('selection').textContent = selected ? '已选 ' + coordinate(...selected) + ' · 确认后落子' : last ? '上一手 ' + coordinate(...last) + ' · 方框标记' : '选择一个交叉点';
    $('place').disabled = !selected || busy || game.over;
    $('place').textContent = selected ? '落子 ' + coordinate(...selected) : '落子';
    $('undo').disabled = !game.moves.length || game.over;
    $('result').textContent = !game.over ? '' : mode === 'local' ? '本局结束。换个先手，再来一局？' :
      game.winner === 1 ? '这一步，由你改写命运。胜局已计入本地战绩。' : game.winner === 2 ? '胜负之外，还有下一步。再试一局吧。' : '势均力敌，平局已记录。';
    renderStats();
  }
  function select(r, c) {
    if (thinking() || game.over) return;
    if (game.board[r][c]) { showToast('这里已经有棋子了'); return; }
    selected = [r, c]; focusIndex = r * 15 + c; render();
  }
  function move(r, c) {
    if (!game.play(r, c)) return;
    selected = null;
    if (game.over && mode === 'ai') {
      const before = Gomoku.unlocked(stats);
      stats = Gomoku.record(stats, game.winner, difficulty);
      const added = Gomoku.achievements.filter(a => Gomoku.unlocked(stats).includes(a.id) && !before.includes(a.id));
      if (added.length) showToast('解锁：' + added.map(a => a.name).join('、'));
    }
    persist(); render(); playSfx(game.winner ? 'good' : 'move');
  }
  function cancelAI() { generation++; clearTimeout(timer); timer = null; }
  function scheduleAI() {
    if (!thinking()) return;
    const token = ++generation;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (token !== generation || !thinking()) return;
      const next = Gomoku.choose(game.board, 2, difficulty);
      if (next) move(...next);
      timer = null;
    }, 320);
  }
  function commit() {
    if (!selected || thinking() || game.over) return;
    move(...selected); scheduleAI();
  }
  function start(config) {
    cancelAI();
    if (mode === 'ai' && game.moves.length && !game.over) stats.streak = 0;
    mode = config.mode; difficulty = config.difficulty;
    game = new Gomoku.Game(); selected = null; focusIndex = 112;
    persist(); render();
  }
  function requestStart(config) {
    if (game.moves.length && !game.over) {
      pending = config; render(); $('restartDialog').showModal();
    } else start(config);
  }
  for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
    const button = document.createElement('button');
    button.type = 'button';
    const index = r * 15 + c;
    baseClasses[index] = 'intersection' + (r === 0 ? ' top' : '') + (r === 14 ? ' bottom' : '') + (c === 0 ? ' left' : '') + (c === 14 ? ' right' : '') +
      (([3, 11].includes(r) && [3, 11].includes(c)) || (r === 7 && c === 7) ? ' star' : '');
    const stone = document.createElement('span'); stone.className = 'stone'; stone.setAttribute('aria-hidden', 'true'); button.appendChild(stone);
    button.addEventListener('click', () => select(r, c));
    button.addEventListener('keydown', event => {
      const directions = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (directions[event.key]) {
        event.preventDefault();
        const [dr, dc] = directions[event.key];
        const rr = Math.max(0, Math.min(14, r + dr)), cc = Math.max(0, Math.min(14, c + dc));
        focusIndex = rr * 15 + cc;
        if (!thinking() && !game.over) selected = game.board[rr][cc] ? null : [rr, cc];
        render(); buttons[focusIndex].focus();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!game.board[r][c]) { select(r, c); commit(); }
      }
    });
    buttons.push(button); $('board').appendChild(button);
  }
  $('place').addEventListener('click', commit);
  $('undo').addEventListener('click', () => {
    if (!game.moves.length || game.over) return;
    cancelAI();
    game.undo(mode === 'local' || game.turn === 2 ? 1 : 2);
    selected = null; persist(); render(); showToast('已撤回，重新想一步');
  });
  $('restart').addEventListener('click', () => requestStart({ mode, difficulty }));
  for (const id of ['mode', 'difficulty']) $(id).addEventListener('change', () => {
    requestStart({ mode: $('mode').value, difficulty: $('difficulty').value });
  });
  $('confirmRestart').addEventListener('click', () => { if (pending) start(pending); pending = null; $('restartDialog').close(); });
  $('cancelRestart').addEventListener('click', () => $('restartDialog').close());
  $('restartDialog').addEventListener('close', () => { pending = null; render(); });
  render(); scheduleAI();
})();
