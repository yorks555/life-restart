/* Freestyle Gomoku. Pure rules and bounded, local AI; no network required. */
(function (root) {
  'use strict';
  const SIZE = 15;
  const DIRECTIONS = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const inside = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;
  const empty = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  function line(board, r, c) {
    if (!inside(r, c) || !board[r][c]) return [];
    const player = board[r][c];
    for (const [dr, dc] of DIRECTIONS) {
      const cells = [[r, c]];
      for (const sign of [-1, 1]) {
        let rr = r + dr * sign, cc = c + dc * sign;
        while (inside(rr, cc) && board[rr][cc] === player) {
          cells.push([rr, cc]); rr += dr * sign; cc += dc * sign;
        }
      }
      if (cells.length >= 5) return cells;
    }
    return [];
  }
  class Game {
    constructor() { this.board = empty(); this.moves = []; this.turn = 1; this.winner = 0; this.winningLine = []; this.draw = false; }
    get over() { return !!this.winner || this.draw; }
    play(r, c) {
      if (!Number.isInteger(r) || !Number.isInteger(c) || !inside(r, c) || this.over || this.board[r][c]) return false;
      this.board[r][c] = this.turn;
      this.moves.push([r, c]);
      this.winningLine = line(this.board, r, c);
      if (this.winningLine.length) this.winner = this.turn;
      else if (this.moves.length === SIZE * SIZE) this.draw = true;
      this.turn = 3 - this.turn;
      return true;
    }
    undo(count = 1) {
      if (this.over) return false; // Completed results are final and cannot be counted again.
      while (count-- > 0 && this.moves.length) {
        const [r, c] = this.moves.pop(); this.board[r][c] = 0; this.turn = 3 - this.turn;
      }
      return true;
    }
    static restore(moves) {
      if (!Array.isArray(moves) || moves.length > SIZE * SIZE) return null;
      const game = new Game();
      for (const move of moves) {
        if (!Array.isArray(move) || move.length !== 2 || !game.play(...move)) return null;
      }
      return game;
    }
  }
  function candidates(board) {
    const cells = new Set();
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
        if (inside(r + dr, c + dc) && !board[r + dr][c + dc]) cells.add((r + dr) * SIZE + c + dc);
      }
    }
    return cells.size ? [...cells].map(i => [Math.floor(i / SIZE), i % SIZE]) : (board[7][7] ? [] : [[7, 7]]);
  }
  function value(board, r, c, player) {
    board[r][c] = player;
    let score = 0;
    for (const [dr, dc] of DIRECTIONS) {
      let length = 1, open = 0;
      for (const sign of [-1, 1]) {
        let rr = r + dr * sign, cc = c + dc * sign;
        while (inside(rr, cc) && board[rr][cc] === player) { length++; rr += dr * sign; cc += dc * sign; }
        if (inside(rr, cc) && board[rr][cc] === 0) open++;
      }
      if (length >= 5) score += 1000000;
      else if (open) score += [0, 2, 35, 600, 20000][length] * (open === 2 ? 5 : 1);
      // Five-cell windows also recognize broken threes and fours.
      for (let offset = -4; offset <= 0; offset++) {
        let count = 0, blocked = false;
        for (let k = offset; k < offset + 5; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (!inside(rr, cc) || (board[rr][cc] && board[rr][cc] !== player)) { blocked = true; break; }
          if (board[rr][cc] === player) count++;
        }
        if (!blocked) score += [0, 1, 8, 70, 1000, 1000000][count];
      }
    }
    board[r][c] = 0;
    return score;
  }
  function rank(board, player) {
    return candidates(board).map(([r, c]) => {
      const attack = value(board, r, c, player), defend = value(board, r, c, 3 - player);
      return { r, c, attack, defend, score: attack + defend * 1.1 - (Math.abs(7 - r) + Math.abs(7 - c)) * .1 };
    }).sort((a, b) => b.score - a.score);
  }
  function choose(board, player = 2, difficulty = 'easy') {
    const ranked = rank(board, player);
    if (!ranked.length) return null;
    const win = ranked.find(m => m.attack >= 1000000);
    if (win) return [win.r, win.c];
    const block = ranked.find(m => m.defend >= 1000000);
    if (block) return [block.r, block.c];
    if (difficulty === 'hard') {
      // Consider the opponent's strongest reply to each of eight promising moves.
      for (const move of ranked.slice(0, 8)) {
        board[move.r][move.c] = player;
        const reply = rank(board, 3 - player).reduce((best, m) => Math.max(best, m.attack), 0);
        board[move.r][move.c] = 0;
        move.lookahead = move.score - reply * 1.3;
      }
      const best = ranked.slice(0, 8).sort((a, b) => b.lookahead - a.lookahead)[0];
      return [best.r, best.c];
    }
    return [ranked[0].r, ranked[0].c];
  }
  const achievements = [
    { id: 'first', icon: '🏅', name: '棋局首胜', hint: '在人机对弈中赢得第一局。' },
    { id: 'streak', icon: '🔥', name: '三连胜', hint: '连续赢得三局人机对弈；平局、落败或中途重开会中断连胜。' },
    { id: 'hard', icon: '💎', name: '迎难而上', hint: '在挑战难度的人机对弈中获胜。' }
  ];
  function stats(value = {}) {
    const result = {};
    for (const key of ['wins', 'losses', 'draws', 'streak', 'bestStreak', 'hardWins']) {
      result[key] = Number.isSafeInteger(value?.[key]) && value[key] >= 0 ? value[key] : 0;
    }
    return result;
  }
  function unlocked(s) { return [s.wins > 0 ? 'first' : '', s.bestStreak >= 3 ? 'streak' : '', s.hardWins > 0 ? 'hard' : ''].filter(Boolean); }
  function record(previous, winner, difficulty) {
    const s = stats(previous);
    if (winner === 1) { s.wins++; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak); if (difficulty === 'hard') s.hardWins++; }
    else { s[winner === 2 ? 'losses' : 'draws']++; s.streak = 0; }
    return s;
  }
  const api = { SIZE, Game, line, choose, stats, record, unlocked, achievements };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Gomoku = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
