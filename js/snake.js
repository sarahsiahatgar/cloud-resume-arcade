// js/snake.js

export function initSnake() {
  const canvas = document.getElementById('snakeCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const grid = 14;
  
  let snake = [{x: 70, y: 70}, {x: 56, y: 70}, {x: 42, y: 70}];
  let dx = grid;
  let dy = 0;
  let food = {x: 140, y: 70};
  let score = 0;
  let snakeInterval = null;
  let snakeActive = false;
  let changingDirection = false;
  let currentDifficulty = 'Normal';

  function toggleDifficulty() {
    if (currentDifficulty === 'Normal') {
      currentDifficulty = 'Hard';
    } else if (currentDifficulty === 'Hard') {
      currentDifficulty = 'Easy';
    } else {
      currentDifficulty = 'Normal';
    }
    document.getElementById('difficultyBtn').textContent = currentDifficulty;
  }

  function drawPreview() {
    ctx.fillStyle = '#1e2319';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x, food.y, grid - 2, grid - 2);

    ctx.fillStyle = '#b5be8a';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, grid - 2, grid - 2));
  }
  
  drawPreview();

  function startSnake() {
    if (snakeInterval) clearInterval(snakeInterval);
    
    snake = [{x: 140, y: 112}];
    dx = grid;
    dy = 0;
    food = {x: 70, y: 70};
    score = 0;
    snakeActive = true;
    changingDirection = false;
    
    document.getElementById('snakeScore').textContent = score;
    document.getElementById('snakeStatus').textContent = 'Game Active! Use Arrows';

    let speed = 150;
    if (currentDifficulty === 'Easy') {
      speed = 220;
    } else if (currentDifficulty === 'Hard') {
      speed = 100;
    }

    snakeInterval = setInterval(gameLoop, speed);
  }

  function gameLoop() {
    changingDirection = false;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
      return gameOver();
    }

    for (let segment of snake) {
      if (head.x === segment.x && head.y === segment.y) return gameOver();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      document.getElementById('snakeScore').textContent = score;
      generateFood();
    } else {
      snake.pop();
    }

    ctx.fillStyle = '#1e2319';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x, food.y, grid - 2, grid - 2);

    ctx.fillStyle = '#b5be8a';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, grid - 2, grid - 2));
  }

  function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / grid)) * grid;
    food.y = Math.floor(Math.random() * (canvas.height / grid)) * grid;
  }

  function gameOver() {
    snakeActive = false;
    clearInterval(snakeInterval);
    document.getElementById('snakeStatus').textContent = 'Game Over! Press Start to retry.';
  }

  function changeSnakeDirection(keyPressed) {
    if (!snakeActive || changingDirection) return;

    const goingUp = dy === -grid;
    const goingDown = dy === grid;
    const goingRight = dx === grid;
    const goingLeft = dx === -grid;

    if (keyPressed === 'ArrowLeft' && !goingRight) {
      dx = -grid;
      dy = 0;
      changingDirection = true;
    }
    if (keyPressed === 'ArrowUp' && !goingDown) {
      dx = 0;
      dy = -grid;
      changingDirection = true;
    }
    if (keyPressed === 'ArrowRight' && !goingLeft) {
      dx = grid;
      dy = 0;
      changingDirection = true;
    }
    if (keyPressed === 'ArrowDown' && !goingUp) {
      dx = 0;
      dy = grid;
      changingDirection = true;
    }
  }
  
  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) { 
      e.preventDefault(); 
    }
    changeSnakeDirection(e.key);
  });

  window.toggleDifficulty = toggleDifficulty;
  window.startSnake = startSnake;
  window.changeSnakeDirection = changeSnakeDirection;
}