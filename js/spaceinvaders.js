// js/space-invaders.js

export function initSpaceInvaders() {
  const canvas = document.getElementById('invadersCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  let playerX = 125;
  let bullets = [];
  let aliens = [];
  let invaderScore = 0;
  let invaderInterval = null;
  let invaderGameActive = false;

  function movePlayer(amount) {
    if (!invaderGameActive) return;
    playerX += amount;
    if (playerX < 0) playerX = 0;
    if (playerX > canvas.width - 30) playerX = canvas.width - 30;
  }

  function fireLaser() {
    if (invaderGameActive) {
      bullets.push({ x: playerX + 13, y: canvas.height - 18 });
    }
  }

  function generateAlienLayout() {
    const layouts = ['scatter', 'v_shape', 'fortress', 'flanks'];
    const chosenLayout = layouts[Math.floor(Math.random() * layouts.length)];
    const generated = [];

    if (chosenLayout === 'scatter') {
      for (let i = 0; i < 12; i++) {
        const rx = 20 + Math.floor(Math.random() * 5) * 40;
        const ry = 15 + Math.floor(Math.random() * 3) * 30;
        if (!generated.some(a => a.x === rx && a.y === ry)) {
          generated.push({ x: rx, y: ry, alive: true, color: '#e74c3c' });
        }
      }
    } else if (chosenLayout === 'v_shape') {
      const coords = [
        {c: 2, r: 0}, 
        {c: 1, r: 1}, {c: 3, r: 1}, 
        {c: 0, r: 2}, {c: 4, r: 2}
      ];
      coords.forEach(p => {
        generated.push({ x: 30 + p.c * 40, y: 15 + p.r * 30, alive: true, color: '#f39c12' });
      });
    } else if (chosenLayout === 'fortress') {
      for (let r = 0; r < 3; r++) {
        const offset = (r % 2 === 0) ? 0 : 20;
        for (let c = 0; c < 5; c++) {
          generated.push({ x: 15 + c * 45 + offset, y: 15 + r * 28, alive: true, color: '#9b59b6' });
        }
      }
    } else if (chosenLayout === 'flanks') {
      [0, 1, 4, 5].forEach(col => {
        for (let row = 0; row < 3; row++) {
          generated.push({ x: 15 + col * 40, y: 15 + row * 30, alive: true, color: '#3498db' });
        }
      });
    }

    return generated;
  }

  function drawInvadersPreview() {
    ctx.fillStyle = '#1e2319';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const previewAliens = [
      {x: 60, y: 30, color: '#e74c3c'}, {x: 100, y: 30, color: '#e74c3c'}, {x: 140, y: 30, color: '#e74c3c'}, {x: 180, y: 30, color: '#e74c3c'},
      {x: 80, y: 65, color: '#f39c12'}, {x: 120, y: 65, color: '#f39c12'}, {x: 160, y: 65, color: '#f39c12'}
    ];
    previewAliens.forEach(a => {
      ctx.fillStyle = a.color;
      ctx.fillRect(a.x, a.y, 24, 18);
    });

    ctx.fillStyle = '#b5be8a';
    ctx.fillRect(125, 170, 30, 12);
    ctx.fillRect(137, 164, 6, 6);
  }

  drawInvadersPreview();

  function startInvaders() {
    if (invaderInterval) clearInterval(invaderInterval);
    
    playerX = 125;
    bullets = [];
    invaderScore = 0;
    invaderGameActive = true;
    
    document.getElementById('invaderScore').textContent = '0';
    document.getElementById('invaderStatus').textContent = 'Defend against the invaders!';

    aliens = generateAlienLayout();
    invaderInterval = setInterval(updateInvaders, 30);
  }

  function updateInvaders() {
    if (!invaderGameActive) return;

    ctx.fillStyle = '#1e2319';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#b5be8a';
    ctx.fillRect(playerX, canvas.height - 30, 30, 12);
    ctx.fillRect(playerX + 12, canvas.height - 36, 6, 6);

    ctx.fillStyle = '#ffffff';
    bullets.forEach((b, index) => {
      b.y -= 6;
      ctx.fillRect(b.x, b.y, 3, 8);
      if (b.y < 0) bullets.splice(index, 1);
    });

    let aliveCount = 0;
    aliens.forEach(a => {
      if (a.alive) {
        aliveCount++;
        ctx.fillStyle = a.color || '#e74c3c';
        ctx.fillRect(a.x, a.y, 24, 18);

        bullets.forEach((b, bIdx) => {
          if (b.x > a.x && b.x < a.x + 24 && b.y > a.y && b.y < a.y + 18) {
            a.alive = false;
            bullets.splice(bIdx, 1);
            invaderScore += 10;
            document.getElementById('invaderScore').textContent = invaderScore;
          }
        });
      }
    });

    if (aliveCount === 0 && aliens.length > 0) {
      clearInterval(invaderInterval);
      invaderGameActive = false;
      document.getElementById('invaderStatus').textContent = '🎉 Fleet cleared! Press Start for next layout.';
    }
  }

  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (invaderGameActive) {
      if (e.key === 'ArrowLeft') movePlayer(-15);
      if (e.key === 'ArrowRight') movePlayer(15);
      if (e.key === ' ' || e.key === 'Spacebar') fireLaser();
    }
  });

  document.getElementById('startInvadersBtn').addEventListener('click', startInvaders);
  
  const leftBtn = document.getElementById('invaderLeftBtn');
  const fireBtn = document.getElementById('invaderFireBtn');
  const rightBtn = document.getElementById('invaderRightBtn');

  leftBtn.addEventListener('pointerdown', e => { movePlayer(-15); e.preventDefault(); });
  fireBtn.addEventListener('pointerdown', e => { fireLaser(); e.preventDefault(); });
  rightBtn.addEventListener('pointerdown', e => { movePlayer(15); e.preventDefault(); });
}