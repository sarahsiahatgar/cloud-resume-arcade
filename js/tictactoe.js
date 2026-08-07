// js/tic-tac-toe.js

let board = ['X', 'O', '', '', 'X', '', '', '', ''];
let gameActive = false; 
let tttWins = 0;

export function initTicTacToe() {
  renderTTT();

  window.makeMove = makeMove;
  window.resetTTT = resetTTT;
}

function makeMove(index) {
  if (!gameActive) {
    resetTTT();
  }
  if (board[index] !== '' || !gameActive) return;
  
  board[index] = 'X';
  renderTTT();

  if (checkWin('X')) {
    document.getElementById('tttStatus').textContent = '🎉 You won!';
    gameActive = false;
    tttWins++;
    document.getElementById('tttScore').textContent = tttWins;
    return;
  }

  if (board.every(cell => cell !== '')) {
    document.getElementById('tttStatus').textContent = "It's a draw!";
    gameActive = false;
    return;
  }
  
  document.getElementById('tttStatus').textContent = "AI is thinking...";
  setTimeout(aiMove, 300);
}

function aiMove() {
  if (!gameActive) return;
  
  const emptyIndices = board
    .map((val, idx) => val === '' ? idx : null)
    .filter(val => val !== null);

  if (emptyIndices.length > 0) {
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    board[randomIndex] = 'O';
    renderTTT();

    if (checkWin('O')) {
      document.getElementById('tttStatus').textContent = '🤖 AI wins!';
      gameActive = false;
    } else {
      document.getElementById('tttStatus').textContent = 'Your turn! (You are X)';
    }
  }
}

function checkWin(player) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return wins.some(combination => combination.every(i => board[i] === player));
}

function renderTTT() {
  const cells = document.querySelectorAll('.ttt-cell');
  cells.forEach((cell, idx) => {
    cell.textContent = board[idx];
  });
}

function resetTTT() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  document.getElementById('tttStatus').textContent = 'Your turn! (You are X)';
  renderTTT();
}