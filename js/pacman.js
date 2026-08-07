// js/pacman.js

export function initPacman() {
  const pacCanvas = document.getElementById('pacmanCanvas');
  if (!pacCanvas) return;
  const pacCtx = pacCanvas.getContext('2d');

  const tileSize = 20;
  const cols = pacCanvas.width / tileSize; 
  const rows = pacCanvas.height / tileSize; 

  let map = [];
  let pac = { r: 1, c: 1, x: 30, y: 30, dx: 0, dy: 0 };
  let nextDir = { r: 0, c: 0 };
  let pacDots = [];
  let currentFruit = null;
  let currentHeart = null;
  let fruitTimer = null;
  let heartTimer = null;
  let heartExpireTimer = null;
  let ghostVulnerableTimer = null;
  let ghosts = [];
  let pacScore = 0;
  let pacInterval = null;
  let pacGameActive = false;
  let isPaused = false;
  let ghostsVulnerable = false;
  let heartVulnerableStartTime = 0;
  let vulnerabilityDuration = 6000;
  let currentDifficulty = 'Normal';

  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (pacGameActive && !isPaused) {
      if (e.key === 'ArrowUp') setNextDir(-1, 0);
      if (e.key === 'ArrowDown') setNextDir(1, 0);
      if (e.key === 'ArrowLeft') setNextDir(0, -1);
      if (e.key === 'ArrowRight') setNextDir(0, 1);
    }
  });

  const upBtn = document.getElementById('pacUpBtn');
  const leftBtn = document.getElementById('pacLeftBtn');
  const downBtn = document.getElementById('pacDownBtn');
  const rightBtn = document.getElementById('pacRightBtn');

  upBtn.addEventListener('pointerdown', e => { setNextDir(-1, 0); e.preventDefault(); });
  leftBtn.addEventListener('pointerdown', e => { setNextDir(0, -1); e.preventDefault(); });
  downBtn.addEventListener('pointerdown', e => { setNextDir(1, 0); e.preventDefault(); });
  rightBtn.addEventListener('pointerdown', e => { setNextDir(0, 1); e.preventDefault(); });

  const diffBtn = document.getElementById('pacDifficultyBtn');
  diffBtn.addEventListener('click', () => {
    if (currentDifficulty === 'Normal') {
      currentDifficulty = 'Hard';
      diffBtn.style.backgroundColor = "#ef4444";
      diffBtn.style.color = "#fff";
    } else if (currentDifficulty === 'Hard') {
      currentDifficulty = 'Easy';
      diffBtn.style.backgroundColor = "#10b981";
      diffBtn.style.color = "#fff";
    } else {
      currentDifficulty = 'Normal';
      diffBtn.style.backgroundColor = "#b5be8a";
      diffBtn.style.color = "#1e2319";
    }
    diffBtn.textContent = currentDifficulty;

    if (pacGameActive && !isPaused) {
      if (pacInterval) clearInterval(pacInterval);
      pacInterval = setInterval(updateGame, getSpeedInterval());
    }
  });

  function getSpeedInterval() {
    switch (currentDifficulty) {
      case 'Easy': return 280;
      case 'Hard': return 160;
      case 'Normal':
      default: return 220;
    }
  }

  const mainActionBtn = document.getElementById('pacMainActionBtn');
  mainActionBtn.addEventListener('click', () => {
    if (!pacGameActive) {
      startPacman();
    } else {
      isPaused = !isPaused;
      if (isPaused) {
        mainActionBtn.textContent = 'Resume';
        document.getElementById('pacStatus').textContent = '⏸️ Game Paused';
        if (pacInterval) clearInterval(pacInterval);
        if (fruitTimer) clearInterval(fruitTimer);
        if (heartTimer) clearInterval(heartTimer);
        if (heartExpireTimer) clearTimeout(heartExpireTimer);
      } else {
        mainActionBtn.textContent = 'Pause';
        document.getElementById('pacStatus').textContent = '▶️ Resumed!';
        pacInterval = setInterval(updateGame, getSpeedInterval());
        
        fruitTimer = setInterval(() => {
          if (pacGameActive && !isPaused) {
            if (currentFruit) currentFruit = null;
            else spawnRandomFruit();
          }
        }, 5000);

        heartTimer = setInterval(() => {
          if (pacGameActive && !isPaused) {
            if (currentHeart) {
              currentHeart = null;
              if (heartExpireTimer) clearTimeout(heartExpireTimer);
            } else {
              spawnRandomHeart();
            }
          }
        }, 10000);
      }
    }
  });

  function validateAccessibility(layout) {
    let visited = Array(rows).fill(0).map(() => Array(cols).fill(false));
    let queue = [{r: 1, c: 1}];
    visited[1][1] = true;
    let reachableCount = 0;
    let totalOpen = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (layout[r][c] === 0) totalOpen++;
      }
    }

    while (queue.length > 0) {
      let curr = queue.shift();
      reachableCount++;
      let dirs = [{r: -1, c: 0}, {r: 1, c: 0}, {r: 0, c: -1}, {r: 0, c: 1}];
      dirs.forEach(d => {
        let nr = curr.r + d.r;
        let nc = curr.c + d.c;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && layout[nr][nc] === 0 && !visited[nr][nc]) {
          visited[nr][nc] = true;
          queue.push({r: nr, c: nc});
        }
      });
    }
    return reachableCount === totalOpen;
  }

  function generateGuaranteedConnectedLayout() {
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 100) {
      attempts++;
      let testMap = Array(rows).fill(0).map(() => Array(cols).fill(1));
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          testMap[r][c] = 0;
        }
      }

      for (let i = 0; i < 18; i++) {
        let sr = Math.floor(Math.random() * (rows - 4)) + 2;
        let sc = Math.floor(Math.random() * (cols - 4)) + 2;
        let length = Math.floor(Math.random() * 4) + 2;
        let isVertical = Math.random() < 0.5;
        let isLShape = Math.random() < 0.3;

        let possible = true;
        let coords = [];
        for (let j = 0; j < length; j++) {
          let cr = sr + (isVertical ? j : 0);
          let cc = sc + (isVertical ? 0 : j);
          if (cr <= 0 || cr >= rows - 1 || cc <= 0 || cc >= cols - 1 || (cr <= 2 && cc <= 2) || (cr >= rows - 3 && cc >= cols - 3)) {
            possible = false;
            break;
          }
          coords.push({r: cr, c: cc});
        }

        let lCoords = [];
        if (possible && isLShape && length >= 3) {
          let branchLen = Math.floor(Math.random() * 2) + 2;
          let pivot = coords[Math.floor(coords.length / 2)];
          let dirOffset = Math.random() < 0.5 ? 1 : -1;
          for (let k = 1; k <= branchLen; k++) {
            let br = pivot.r + (isVertical ? 0 : k * dirOffset);
            let bc = pivot.c + (isVertical ? k * dirOffset : 0);
            if (br <= 0 || br >= rows - 1 || bc <= 0 || bc >= cols - 1) break;
            lCoords.push({r: br, c: bc});
          }
        }

        if (possible) {
          coords.forEach(pt => testMap[pt.r][pt.c] = 1);
          lCoords.forEach(pt => testMap[pt.r][pt.c] = 1);
        }
      }

      testMap[1][1] = 0;
      testMap[1][2] = 0;
      testMap[2][1] = 0;
      testMap[rows - 2][cols - 2] = 0;
      testMap[rows - 2][cols - 3] = 0;
      testMap[rows - 3][cols - 2] = 0;

      if (validateAccessibility(testMap)) {
        map = testMap;
        valid = true;
      }
    }

    if (!valid) {
      map = Array(rows).fill(0).map(() => Array(cols).fill(1));
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          map[r][c] = 0;
        }
      }
    }
  }

  function initItems() {
    pacDots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (map[r][c] === 0 && !(r === 1 && c === 1)) {
          pacDots.push({ r: r, c: c, active: true });
        }
      }
    }
    currentFruit = null;
    currentHeart = null;
  }

  function spawnRandomFruit() {
    if (!pacGameActive || isPaused) return;
    const emptyTiles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (map[r][c] === 0 && !(r === 1 && c === 1)) {
          emptyTiles.push({ r: r, c: c });
        }
      }
    }
    if (emptyTiles.length > 0) {
      const spot = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      const fruitTypes = ['🍒', '🍌', '🍎', '🍓'];
      currentFruit = { r: spot.r, c: spot.c, type: fruitTypes[Math.floor(Math.random() * fruitTypes.length)] };
    }
  }

  function spawnRandomHeart() {
    if (!pacGameActive || isPaused || ghostsVulnerable) return;
    const emptyTiles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (map[r][c] === 0 && !(r === 1 && c === 1)) {
          emptyTiles.push({ r: r, c: c });
        }
      }
    }
    if (emptyTiles.length > 0) {
      const spot = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      currentHeart = { r: spot.r, c: spot.c, type: '🤍' };

      if (heartExpireTimer) clearTimeout(heartExpireTimer);
      heartExpireTimer = setTimeout(() => {
        if (pacGameActive && !isPaused) {
          currentHeart = null;
        }
      }, 5000);
    }
  }

  function drawMaze() {
    pacCtx.fillStyle = '#1e2319';
    pacCtx.fillRect(0, 0, pacCanvas.width, pacCanvas.height);
    pacCtx.fillStyle = '#3b4432';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (map[r][c] === 1) {
          pacCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
        }
      }
    }
  }

  function drawPacman(x, y, dx, dy) {
    pacCtx.fillStyle = '#f1c40f';
    pacCtx.beginPath();
    let angle = 0;
    if (dy > 0) angle = 0;
    else if (dy < 0) angle = Math.PI;
    else if (dx > 0) angle = Math.PI / 2;
    else if (dx < 0) angle = Math.PI * 1.5;

    let mouthOpen = Math.floor(Date.now() / 120) % 2 === 0;
    if (mouthOpen && (dx !== 0 || dy !== 0)) {
      pacCtx.arc(x, y, 8, angle + 0.2 * Math.PI, angle + 1.8 * Math.PI);
      pacCtx.lineTo(x, y);
    } else {
      pacCtx.arc(x, y, 8, 0, Math.PI * 2);
    }
    pacCtx.fill();

    pacCtx.fillStyle = '#1e2319';
    let eyeX = x, eyeY = y - 3;
    if (dy > 0) { eyeX = x + 1; eyeY = y - 3; }
    else if (dy < 0) { eyeX = x - 1; eyeY = y - 3; }
    else if (dx > 0) { eyeX = x + 3; eyeY = y; }
    else if (dx < 0) { eyeX = x - 3; eyeY = y - 2; }
    
    pacCtx.beginPath();
    pacCtx.arc(eyeX, eyeY, 1.2, 0, Math.PI * 2);
    pacCtx.fill();
  }

  function drawGhost(x, y, color, isEaten) {
    if (isEaten) return;
    let r = 8;
    pacCtx.fillStyle = color;
    pacCtx.beginPath();
    pacCtx.arc(x, y - 1, r, Math.PI, 0, false);
    pacCtx.lineTo(x + r, y + r);
    pacCtx.lineTo(x + r - 2, y + r - 2);
    pacCtx.lineTo(x + r - 4, y + r);
    pacCtx.lineTo(x, y + r - 2);
    pacCtx.lineTo(x - r + 4, y + r);
    pacCtx.lineTo(x - r + 2, y + r - 2);
    pacCtx.lineTo(x - r, y + r);
    pacCtx.closePath();
    pacCtx.fill();

    pacCtx.fillStyle = color === '#ffffff' ? '#e74c3c' : '#ffffff';
    pacCtx.beginPath();
    pacCtx.arc(x - 3, y - 2, 2.5, 0, Math.PI * 2);
    pacCtx.arc(x + 3, y - 2, 2.5, 0, Math.PI * 2);
    pacCtx.fill();

    pacCtx.fillStyle = color === '#ffffff' ? '#c0392b' : '#2980b9';
    pacCtx.beginPath();
    pacCtx.arc(x - 3, y - 2, 1, 0, Math.PI * 2);
    pacCtx.arc(x + 3, y - 2, 1, 0, Math.PI * 2);
    pacCtx.fill();
  }

  function drawPreview() {
    generateGuaranteedConnectedLayout();
    initItems();
    drawMaze();
    pacCtx.fillStyle = '#d2daab';
    pacDots.forEach(d => {
      pacCtx.beginPath();
      pacCtx.arc(d.c * tileSize + tileSize/2, d.r * tileSize + tileSize/2, 2.5, 0, Math.PI * 2);
      pacCtx.fill();
    });
    drawPacman(30, 30, 0, 1);
    drawGhost(250, 170, '#e74c3c', false);
  }
  drawPreview();

  function setNextDir(dr, dc) {
    if (!pacGameActive || isPaused) return;
    nextDir = { r: dr, c: dc };
  }

  function startPacman() {
    if (pacInterval) clearInterval(pacInterval);
    if (fruitTimer) clearInterval(fruitTimer);
    if (heartTimer) clearInterval(heartTimer);
    if (heartExpireTimer) clearTimeout(heartExpireTimer);
    if (ghostVulnerableTimer) clearTimeout(ghostVulnerableTimer);

    generateGuaranteedConnectedLayout();
    initItems();

    pac = { r: 1, c: 1, x: 1 * tileSize + tileSize/2, y: 1 * tileSize + tileSize/2, dx: 0, dy: 0 };
    nextDir = { r: 0, c: 0 };
    pacScore = 0;
    pacGameActive = true;
    isPaused = false;
    ghostsVulnerable = false;
    document.getElementById('pacScore').textContent = '0';
    document.getElementById('pacStatus').textContent = 'Press a direction button to move!';
    
    mainActionBtn.textContent = 'Pause';
    
    ghosts = [
      { r: rows - 2, c: cols - 2, x: (cols - 2) * tileSize + tileSize/2, y: (rows - 2) * tileSize + tileSize/2, color: '#e74c3c', origColor: '#e74c3c', eaten: false, respawnTimeout: null },
      { r: rows - 2, c: cols - 3, x: (cols - 3) * tileSize + tileSize/2, y: (rows - 2) * tileSize + tileSize/2, color: '#3498db', origColor: '#3498db', eaten: false, respawnTimeout: null }
    ];

    pacInterval = setInterval(updateGame, getSpeedInterval());

    fruitTimer = setInterval(() => {
      if (pacGameActive && !isPaused) {
        if (currentFruit) currentFruit = null;
        else spawnRandomFruit();
      }
    }, 5000);

    heartTimer = setInterval(() => {
      if (pacGameActive && !isPaused) {
        if (currentHeart) {
          currentHeart = null;
          if (heartExpireTimer) clearTimeout(heartExpireTimer);
        } else {
          spawnRandomHeart();
        }
      }
    }, 10000);
  }

  function updateGame() {
    if (!pacGameActive || isPaused) return;

    let targetR = pac.r + nextDir.r;
    let targetC = pac.c + nextDir.c;
    if (targetR >= 0 && targetR < rows && targetC >= 0 && targetC < cols && map[targetR][targetC] === 0) {
      pac.dx = nextDir.r;
      pac.dy = nextDir.c;
    }

    let nextR = pac.r + pac.dx;
    let nextC = pac.c + pac.dy;
    if (nextR >= 0 && nextR < rows && nextC >= 0 && nextC < cols && map[nextR][nextC] === 0) {
      pac.r = nextR;
      pac.c = nextC;
    } else {
      pac.dx = 0;
      pac.dy = 0;
    }

    pac.x = pac.c * tileSize + tileSize / 2;
    pac.y = pac.r * tileSize + tileSize / 2;

    pacDots.forEach(dot => {
      if (dot.active && dot.r === pac.r && dot.c === pac.c) {
        dot.active = false;
        pacScore += 10;
        document.getElementById('pacScore').textContent = pacScore;
      }
    });

    if (currentFruit && currentFruit.r === pac.r && currentFruit.c === pac.c) {
      pacScore += 50;
      document.getElementById('pacScore').textContent = pacScore;
      currentFruit = null;
    }

    if (currentHeart && currentHeart.r === pac.r && currentHeart.c === pac.c) {
      pacScore += 30;
      document.getElementById('pacScore').textContent = pacScore;
      currentHeart = null;
      if (heartExpireTimer) clearTimeout(heartExpireTimer);
      
      ghostsVulnerable = true;
      heartVulnerableStartTime = Date.now();

      ghosts.forEach(g => {
        if (!g.eaten) g.color = '#ffffff';
        if (g.respawnTimeout) clearTimeout(g.respawnTimeout);
      });

      if (ghostVulnerableTimer) clearTimeout(ghostVulnerableTimer);
      ghostVulnerableTimer = setTimeout(() => {
        if (!isPaused) {
          ghostsVulnerable = false;
          ghosts.forEach(g => {
            if (!g.eaten) g.color = g.origColor;
          });
        }
      }, vulnerabilityDuration);
    }

    if (ghostsVulnerable) {
      let timeLeft = Math.max(0, Math.ceil((vulnerabilityDuration - (Date.now() - heartVulnerableStartTime)) / 1000));
      document.getElementById('pacStatus').textContent = `⚡ Ghosts White! Countdown: ${timeLeft}s`;
    } else {
      document.getElementById('pacStatus').textContent = 'Navigate the maze & avoid the ghosts!';
    }

    ghosts.forEach(g => {
      if (g.eaten) return;
      let directions = [{r: -1, c: 0}, {r: 1, c: 0}, {r: 0, c: -1}, {r: 0, c: 1}];
      let validMoves = directions.filter(d => {
        let nr = g.r + d.r;
        let nc = g.c + d.c;
        return nr >= 0 && nr < rows && nc >= 0 && nc < cols && map[nr][nc] === 0;
      });

      if (validMoves.length > 0) {
        let chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
        g.r += chosen.r;
        g.c += chosen.c;
      }

      g.x = g.c * tileSize + tileSize / 2;
      g.y = g.r * tileSize + tileSize / 2;

      if (g.r === pac.r && g.c === pac.c) {
        if (ghostsVulnerable) {
          g.eaten = true;
          pacScore += 100;
          document.getElementById('pacScore').textContent = pacScore;
          let remainingTime = Math.max(300, vulnerabilityDuration - (Date.now() - heartVulnerableStartTime));
          g.respawnTimeout = setTimeout(() => {
            if (!pacGameActive || isPaused) return;
            g.r = rows - 2;
            g.c = cols - 2;
            g.x = g.c * tileSize + tileSize/2;
            g.y = g.r * tileSize + tileSize/2;
            g.eaten = false;
            g.color = g.origColor;
          }, remainingTime);
        } else {
          clearInterval(pacInterval);
          clearInterval(fruitTimer);
          clearInterval(heartTimer);
          if (heartExpireTimer) clearTimeout(heartExpireTimer);
          if (ghostVulnerableTimer) clearTimeout(ghostVulnerableTimer);
          ghosts.forEach(g => { if (g.respawnTimeout) clearTimeout(g.respawnTimeout); });
          pacGameActive = false;
          isPaused = false;
          mainActionBtn.textContent = 'Start';
          document.getElementById('pacStatus').textContent = '💥 Caught by a ghost! Game Over.';
        }
      }
    });

    let remainingDots = pacDots.filter(d => d.active).length;
    if (remainingDots === 0) {
      clearInterval(pacInterval);
      clearInterval(fruitTimer);
      clearInterval(heartTimer);
      if (heartExpireTimer) clearTimeout(heartExpireTimer);
      if (ghostVulnerableTimer) clearTimeout(ghostVulnerableTimer);
      ghosts.forEach(g => { if (g.respawnTimeout) clearTimeout(g.respawnTimeout); });
      pacGameActive = false;
      isPaused = false;
      mainActionBtn.textContent = 'Start';
      document.getElementById('pacStatus').textContent = '🎉 Brilliant! You cleared the maze!';
    }

    drawMaze();
    pacCtx.fillStyle = '#d2daab';
    pacDots.forEach(dot => {
      if (dot.active) {
        pacCtx.beginPath();
        pacCtx.arc(dot.c * tileSize + tileSize/2, dot.r * tileSize + tileSize/2, 2.5, 0, Math.PI * 2);
        pacCtx.fill();
      }
    });

    if (currentFruit) {
      pacCtx.font = '14px sans-serif';
      pacCtx.textAlign = 'center';
      pacCtx.textBaseline = 'middle';
      pacCtx.fillText(currentFruit.type, currentFruit.c * tileSize + tileSize/2, currentFruit.r * tileSize + tileSize/2);
    }
    if (currentHeart) {
      pacCtx.font = '14px sans-serif';
      pacCtx.textAlign = 'center';
      pacCtx.textBaseline = 'middle';
      pacCtx.fillText(currentHeart.type, currentHeart.c * tileSize + tileSize/2, currentHeart.r * tileSize + tileSize/2);
    }

    drawPacman(pac.x, pac.y, pac.dx, pac.dy);
    ghosts.forEach(g => drawGhost(g.x, g.y, g.color, g.eaten));
  }
}