export function initVikingGame() {
  const API_URL = "https://ist6lo7av7.execute-api.us-east-1.amazonaws.com/";

  const canvas = document.getElementById("vikingCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let gameInterval;
  let score = 0;
  let wave = 1;
  let longhouseHp = 100;
  let isGameOver = false;
  let isPaused = false;
  let cloudHighScore = 0;
  let leftHandedMode = false;
  let currentDifficulty = 'Normal';

  let enemies = [];
  let powerUps = [];
  let projectiles = [];

  let isShooting = false;
  let targetX = 0;
  let targetY = 0;
  let shootTimer = 0;

  let shieldActive = false;
  let shieldTimer = 0;
  let multiShotActive = false;
  let multiShotTimer = 0;

  const defender = {
    x: 35,
    y: canvas.height / 2
  };

  const diffBtn = document.getElementById("vikingDifficultyBtn");
  diffBtn.addEventListener('click', () => {
    if (gameInterval && !isGameOver) return;
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
  });

  document.getElementById("leftHandedBtn").addEventListener('click', toggleLeftHanded);
  document.getElementById("startBtn").addEventListener('click', startGame);
  document.getElementById("pauseBtn").addEventListener('click', togglePause);
  document.getElementById("restartBtn").addEventListener('click', restartGame);
  document.getElementById("exitGameBtn").addEventListener('click', exitGameOver);
  document.getElementById("submitScoreBtn").addEventListener('click', submitScore);

  function drawInitialScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#7ec8e3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    defender.x = leftHandedMode ? canvas.width - 35 : 35;

    if (leftHandedMode) {
      ctx.fillStyle = "#6b4423";
      ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
      ctx.fillStyle = "#a06b38";
      ctx.fillRect(canvas.width - 50, 0, 10, canvas.height);
    } else {
      ctx.fillStyle = "#6b4423";
      ctx.fillRect(0, 0, 50, canvas.height);
      ctx.fillStyle = "#a06b38";
      ctx.fillRect(40, 0, 10, canvas.height);
    }

    drawMinecraftHuman(defender.x - 12, defender.y - 24, 24, 48, false, true);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️ Please help me defend my fort! 🛡️", canvas.width / 2, canvas.height / 2);
    ctx.textBaseline = "alphabetic";
  }

  function toggleLeftHanded() {
    if (gameInterval && !isGameOver) return;
    leftHandedMode = !leftHandedMode;
    const btn = document.getElementById("leftHandedBtn");
    if (leftHandedMode) {
      btn.textContent = "Left-Handed? On";
    } else {
      btn.textContent = "Left-Handed? Off";
    }
    drawInitialScreen();
  }

  function startGame() {
    diffBtn.style.display = "none";
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("leftHandedBtn").style.display = "none";
    document.getElementById("pauseBtn").style.display = "inline-block";
    document.getElementById("restartBtn").style.display = "inline-block";
    document.getElementById("exitGameBtn").style.display = "inline-block";
    document.getElementById("gameOverScreen").style.display = "none";
    
    defender.x = leftHandedMode ? canvas.width - 35 : 35;

    score = 0;
    wave = 1;
    longhouseHp = 100;
    isGameOver = false;
    isPaused = false;
    const pauseBtn = document.getElementById("pauseBtn");
    pauseBtn.textContent = "Pause";
    

    enemies = [];
    powerUps = [];
    projectiles = [];
    isShooting = false;
    shootTimer = 0;
    shieldActive = false;
    shieldTimer = 0;
    multiShotActive = false;
    multiShotTimer = 0;

    spawnWave();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(updateGame, 1000 / 60);
  }

  function manualRestart() {
    if (gameInterval) clearInterval(gameInterval);
    isGameOver = true;
    isPaused = false;

    score = 0;
    wave = 1;
    longhouseHp = 100;
    document.getElementById("scoreDisplay").textContent = score;
    document.getElementById("waveDisplay").textContent = `Wave: ${wave}`;
    document.getElementById("hpDisplay").textContent = `HP: ${longhouseHp}`;
    document.getElementById("powerupStatus").textContent = "";

    document.getElementById("playerName").value = "";
    document.getElementById("gameOverInputRow").style.display = "none";
    document.getElementById("submitScoreBtn").style.display = "none";
    document.getElementById("pauseBtn").style.display = "none";
    document.getElementById("restartBtn").style.display = "none";
    document.getElementById("exitGameBtn").style.display = "none";
    
    diffBtn.style.display = "inline-block";
    document.getElementById("startBtn").style.display = "inline-block";
    document.getElementById("leftHandedBtn").style.display = "inline-block";
    document.getElementById("gameOverScreen").style.display = "none";

    drawInitialScreen();
  }

  function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    const pauseBtn = document.getElementById("pauseBtn");
    if (isPaused) {
      pauseBtn.textContent = "Resume";
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME PAUSED", canvas.width / 2, canvas.height / 2);
      ctx.textBaseline = "alphabetic";
    } else {
      pauseBtn.textContent = "Pause";
    }
  }

  function spawnWave() {
    let enemyCount = 3 + wave * 2;
    let speedMultiplier = 1.0;
    if (currentDifficulty === 'Easy') speedMultiplier = 0.65;
    if (currentDifficulty === 'Hard') speedMultiplier = 1.45;

    for (let i = 0; i < enemyCount; i++) {
      let isHeavy = Math.random() < 0.08; 

      let startX = leftHandedMode ? 
        -300 - Math.random() * 300 - (i * 60) : 
        canvas.width + Math.random() * 300 + (i * 60);

      let baseSpeed = isHeavy ? (0.8 + (wave * 0.2)) : (1.2 + (wave * 0.3));

      enemies.push({
        x: startX,
        y: Math.random() * (canvas.height - 110) + 40,
        width: isHeavy ? 36 : 24,
        height: isHeavy ? 56 : 40,
        speed: baseSpeed * speedMultiplier,
        hp: isHeavy ? 4 : 1,
        maxHp: isHeavy ? 4 : 1,
        isHeavy: isHeavy
      });
    }

    let types = [];
    if (longhouseHp < 100) types.push('health');
    types.push('shield', 'multishot');

    if (Math.random() < 0.75 && types.length > 0) {
      let chosenType = types[Math.floor(Math.random() * types.length)];
      let powerUpStartX = leftHandedMode ? -100 : canvas.width + 100;
      powerUps.push({
        x: powerUpStartX,
        y: Math.random() * (canvas.height - 80) + 30,
        width: 36,
        height: 36,
        speed: 1.5,
        type: chosenType
      });
    }
  }

  function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  canvas.addEventListener("mousedown", function(e) {
    if (isGameOver || isPaused) return;
    isShooting = true;
    const coords = getCanvasCoordinates(e);
    targetX = coords.x;
    targetY = coords.y;
  });

  window.addEventListener("mousemove", function(e) {
    if (!isShooting || isGameOver || isPaused) return;
    const coords = getCanvasCoordinates(e);
    targetX = coords.x;
    targetY = coords.y;
  });

  window.addEventListener("mouseup", function() {
    isShooting = false;
  });

  canvas.addEventListener("touchstart", function(e) {
    if (isGameOver || isPaused) return;
    e.preventDefault();
    isShooting = true;
    const coords = getCanvasCoordinates(e);
    targetX = coords.x;
    targetY = coords.y;
  }, { passive: false });

  canvas.addEventListener("touchmove", function(e) {
    if (!isShooting || isGameOver || isPaused) return;
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    targetX = coords.x;
    targetY = coords.y;
  }, { passive: false });

  window.addEventListener("touchend", function() {
    isShooting = false;
  });

  function fireArrow(angleOffset = 0) {
    const angle = Math.atan2(targetY - defender.y, targetX - defender.x) + angleOffset;
    const speed = 9;

    projectiles.push({
      x: defender.x,
      y: defender.y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      angle: angle,
      length: 22,
      width: 4
    });
  }

  function drawMinecraftHuman(x, y, w, h, isHeavy, isPlayer = false) {
    let headSize = w * 0.75;
    let headX = x + (w - headSize) / 2;
    let headY = y;
    
    let torsoW = w * 0.8;
    let torsoH = h * 0.45;
    let torsoX = x + (w - torsoW) / 2;
    let torsoY = headY + headSize;

    let limbW = w * 0.28;
    let limbH = h * 0.35;
    let legY = torsoY + torsoH;

    if (isPlayer) {
      ctx.fillStyle = "#2c3e50";
      ctx.fillRect(torsoX + 2, legY, limbW - 1, limbH);
      ctx.fillRect(torsoX + torsoW - limbW - 1, legY, limbW - 1, limbH);

      ctx.fillStyle = "#c0392b";
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = "#f39c12";
      ctx.fillRect(torsoX, torsoY + torsoH - 4, torsoW, 4);

      ctx.fillStyle = "#c0392b";
      ctx.fillRect(torsoX - limbW + 2, torsoY, limbW - 2, torsoH - 4);
      ctx.fillRect(torsoX + torsoW - 2, torsoY, limbW - 2, torsoH - 4);

      ctx.fillStyle = "#f5cba7";
      ctx.fillRect(headX, headY, headSize, headSize);
      ctx.fillStyle = "#4a3525";
      ctx.fillRect(headX, headY + headSize * 0.5, headSize, headSize * 0.5);

      ctx.fillStyle = "#34495e";
      ctx.fillRect(headX - 2, headY - 4, headSize + 4, headSize * 0.5);
      ctx.fillStyle = "#ecf0f1";
      ctx.fillRect(headX - 6, headY - 8, 5, 5);
      ctx.fillRect(headX + headSize + 1, headY - 8, 5, 5);
    } else if (isHeavy) {
      ctx.fillStyle = "#222";
      ctx.fillRect(x - 4, y - 14, w + 8, 5);
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(x - 3, y - 13, (w + 6) * (this.hp / this.maxHp), 3);

      ctx.fillStyle = "#273746";
      ctx.fillRect(torsoX + 2, legY, limbW - 1, limbH);
      ctx.fillRect(torsoX + torsoW - limbW - 1, legY, limbW - 1, limbH);

      ctx.fillStyle = "#78281f";
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = "#d4ac0d";
      ctx.fillRect(torsoX + 3, torsoY + 4, torsoW - 6, 4);

      ctx.fillStyle = "#78281f";
      ctx.fillRect(torsoX - limbW + 2, torsoY, limbW - 2, torsoH - 4);
      ctx.fillRect(torsoX + torsoW - 2, torsoY, limbW - 2, torsoH - 4);

      ctx.fillStyle = "#f5cba7";
      ctx.fillRect(headX, headY, headSize, headSize);
      ctx.fillStyle = "#17202a";
      ctx.fillRect(headX + 4, headY + 5, 3, 3);
      ctx.fillRect(headX + headSize - 7, headY + 5, 3, 3);

      ctx.fillStyle = "#b7950b";
      ctx.fillRect(headX - 3, headY - 5, headSize + 6, headSize * 0.55);
      ctx.fillStyle = "#f1c40f";
      ctx.fillRect(headX - 8, headY - 10, 6, 7);
      ctx.fillRect(headX + headSize + 2, headY - 10, 6, 7);
    } else {
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(torsoX + 2, legY, limbW - 1, limbH);
      ctx.fillRect(torsoX + torsoW - limbW - 1, legY, limbW - 1, limbH);

      ctx.fillStyle = "#795548";
      ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      ctx.fillStyle = "#4e342e";
      ctx.fillRect(torsoX, torsoY + torsoH - 4, torsoW, 3);

      ctx.fillStyle = "#795548";
      ctx.fillRect(torsoX - limbW + 2, torsoY, limbW - 2, torsoH - 4);
      ctx.fillRect(torsoX + torsoW - 2, torsoY, limbW - 2, torsoH - 4);

      ctx.fillStyle = "#f5cba7";
      ctx.fillRect(headX, headY, headSize, headSize);
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(headX + 2, headY + headSize * 0.6, headSize - 4, headSize * 0.4);

      ctx.fillStyle = "#5d4037";
      ctx.fillRect(headX - 2, headY - 4, headSize + 4, headSize * 0.5);
      ctx.fillStyle = "#ecf0f1";
      ctx.fillRect(headX - 5, headY - 7, 4, 4);
      ctx.fillRect(headX + headSize + 1, headY - 7, 4, 4);
    }
  }

  function updateGame() {
    if (isPaused || isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#7ec8e3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isShooting) {
      shootTimer++;
      if (shootTimer >= 12) {
        shootTimer = 0;
        if (multiShotActive) {
          fireArrow(-0.35);
          fireArrow(-0.17);
          fireArrow(0);
          fireArrow(0.17);
          fireArrow(0.35);
        } else {
          fireArrow(0);
        }
      }
    }

    if (shieldActive) {
      shieldTimer--;
      if (shieldTimer <= 0) shieldActive = false;
    }
    if (multiShotActive) {
      multiShotTimer--;
      if (multiShotTimer <= 0) multiShotActive = false;
    }

    if (leftHandedMode) {
      if (shieldActive) {
        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
        ctx.fillStyle = "#f97316";
        ctx.fillRect(canvas.width - 56, 0, 16, canvas.height);

        let time = Date.now() / 80;
        ctx.fillStyle = "#fbbf24";
        for (let fy = 0; fy < canvas.height; fy += 20) {
          let flameHeight = 12 + Math.sin(time + fy) * 6;
          ctx.beginPath();
          ctx.moveTo(canvas.width - 50, fy);
          ctx.lineTo(canvas.width - 50 - flameHeight, fy + 10);
          ctx.lineTo(canvas.width - 50, fy + 20);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "#6b4423";
        ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);
        ctx.fillStyle = "#a06b38";
        ctx.fillRect(canvas.width - 50, 0, 10, canvas.height);
      }
    } else {
      if (shieldActive) {
        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(0, 0, 50, canvas.height);
        ctx.fillStyle = "#f97316";
        ctx.fillRect(40, 0, 16, canvas.height);

        let time = Date.now() / 80;
        ctx.fillStyle = "#fbbf24";
        for (let fy = 0; fy < canvas.height; fy += 20) {
          let flameHeight = 12 + Math.sin(time + fy) * 6;
          ctx.beginPath();
          ctx.moveTo(50, fy);
          ctx.lineTo(50 + flameHeight, fy + 10);
          ctx.lineTo(50, fy + 20);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = "#6b4423";
        ctx.fillRect(0, 0, 50, canvas.height);
        ctx.fillStyle = "#a06b38";
        ctx.fillRect(40, 0, 10, canvas.height);
      }
    }

    drawMinecraftHuman(defender.x - 12, defender.y - 24, 24, 48, false, true);

    for (let i = projectiles.length - 1; i >= 0; i--) {
      let p = projectiles[i];
      p.x += p.dx;
      p.y += p.dy;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      
      ctx.fillStyle = "#8d6e63";
      ctx.fillRect(-p.length / 2, -p.width / 2, p.length, p.width);

      ctx.fillStyle = "#bdc3c7";
      ctx.beginPath();
      ctx.moveTo(p.length / 2, -p.width * 1.5);
      ctx.lineTo(p.length / 2 + 8, 0);
      ctx.lineTo(p.length / 2, p.width * 1.5);
      ctx.fill();

      ctx.fillStyle = "#e74c3c";
      ctx.beginPath();
      ctx.moveTo(-p.length / 2, 0);
      ctx.lineTo(-p.length / 2 - 6, -6);
      ctx.lineTo(-p.length / 2 - 3, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-p.length / 2, 0);
      ctx.lineTo(-p.length / 2 - 6, 6);
      ctx.lineTo(-p.length / 2 - 3, 0);
      ctx.fill();

      ctx.restore();

      if (p.x > canvas.width || p.x < 0 || p.y > canvas.height || p.y < 0) {
        projectiles.splice(i, 1);
      }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
      let pu = powerUps[i];
      if (leftHandedMode) {
        pu.x += pu.speed;
      } else {
        pu.x -= pu.speed;
      }

      let cx = pu.x + pu.width / 2;
      let cy = pu.y + pu.height / 2;

      if (pu.type === 'health') {
        ctx.fillStyle = "#7ec8e3";
        ctx.fillRect(pu.x, pu.y, pu.width, pu.height);

        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💚", cx, cy);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      } else if (pu.type === 'shield') {
        ctx.fillStyle = "#7ec8e3";
        ctx.fillRect(pu.x, pu.y, pu.width, pu.height);

        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🔥", cx, cy);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      } else if (pu.type === 'multishot') {
        ctx.fillStyle = "#7ec8e3";
        ctx.fillRect(pu.x, pu.y, pu.width, pu.height);

        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚔️", cx, cy);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      }

      if ((leftHandedMode && pu.x >= canvas.width - 50) || (!leftHandedMode && pu.x <= 50)) {
        powerUps.splice(i, 1);
        continue;
      }

      for (let j = projectiles.length - 1; j >= 0; j--) {
        let p = projectiles[j];
        if (
          p.x > pu.x &&
          p.x < pu.x + pu.width &&
          p.y > pu.y &&
          p.y < pu.y + pu.height
        ) {
          if (pu.type === 'health') {
            longhouseHp = Math.min(100, longhouseHp + 20);
          } else if (pu.type === 'shield') {
            shieldActive = true;
            shieldTimer = 600;
          } else if (pu.type === 'multishot') {
            multiShotActive = true;
            multiShotTimer = 300;
          }
          powerUps.splice(i, 1);
          projectiles.splice(j, 1);
          score += 50;
          break;
        }
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      
      if (leftHandedMode) {
        enemy.x += enemy.speed;
      } else {
        enemy.x -= enemy.speed;
      }

      drawMinecraftHuman.call(enemy, enemy.x, enemy.y, enemy.width, enemy.height, enemy.isHeavy, false);

      let hitWall = leftHandedMode ? (enemy.x + enemy.width >= canvas.width - 50) : (enemy.x <= 50);

      if (hitWall) {
        if (shieldActive) {
          score += 15;
        } else {
          let dmgMultiplier = currentDifficulty === 'Hard' ? 1.5 : (currentDifficulty === 'Easy' ? 0.75 : 1.0);
          longhouseHp -= Math.round((enemy.isHeavy ? 25 : 10) * dmgMultiplier);
          if (longhouseHp <= 0) {
            longhouseHp = 0;
            endGame();
          }
        }
        enemies.splice(i, 1);
        continue;
      }

      for (let j = projectiles.length - 1; j >= 0; j--) {
        let p = projectiles[j];
        if (
          p.x > enemy.x &&
          p.x < enemy.x + enemy.width &&
          p.y > enemy.y &&
          p.y < enemy.y + enemy.height
        ) {
          enemy.hp--;
          projectiles.splice(j, 1);

          if (enemy.hp <= 0) {
            enemies.splice(i, 1);
            score += enemy.isHeavy ? 100 : 25;
          }
          break;
        }
      }
    }

    if (enemies.length === 0 && !isGameOver) {
      wave++;
      score += 100 * wave;
      spawnWave();
    }

    document.getElementById("scoreDisplay").textContent = score;
    document.getElementById("waveDisplay").textContent = `Wave: ${wave}`;
    document.getElementById("hpDisplay").textContent = `HP: ${longhouseHp}`;

    let powerupStatusEl = document.getElementById("powerupStatus");
    if (powerupStatusEl) {
      let powerupText = "";
      if (shieldActive) powerupText += `🔥 SHIELD: ${Math.ceil(shieldTimer/60)}s `;
      if (multiShotActive) powerupText += `⚔️ 5-SHOT: ${Math.ceil(multiShotTimer/60)}s`;
      powerupStatusEl.textContent = powerupText;
    }
  }

  function endGame() {
    isGameOver = true;
    
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ef4444";
    ctx.font = "24px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    let endMessage = "FALLEN!";
    if (score > cloudHighScore && cloudHighScore > 0) {
      endMessage = "NEW HIGH SCORE!";
    }
    ctx.fillText(endMessage, canvas.width / 2, canvas.height / 2);
    ctx.textBaseline = "alphabetic";

    document.getElementById("finalScoreLabel").textContent = `Score: ${score}`;

    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("gameOverInputRow").style.display = "flex";
    
    document.getElementById("pauseBtn").style.display = "none";
    
    document.getElementById("submitScoreBtn").style.display = "inline-block";
    document.getElementById("restartBtn").style.display = "inline-block";
    document.getElementById("exitGameBtn").style.display = "inline-block";
  }

  function exitGameOver() {
    document.getElementById("playerName").value = "";
    manualRestart();
  }

  function restartGame() {
    manualRestart();
  }

  async function submitScore() {
    const nameInput = document.getElementById("playerName").value.trim() || "Anonymous";
    const finalScore = score;

    try {
      const response = await fetch(`${API_URL}?action=submit_score&game=viking2&name=${encodeURIComponent(nameInput)}&score=${finalScore}`);
      const data = await response.json();
      alert(data.message || "Score submitted successfully!");
      manualRestart();
      fetchLeaderboard();
    } catch (err) {
      console.error("Error submitting score:", err);
      alert("Failed to save score. Check your network or API connection.");
      manualRestart();
    }
  }

  async function fetchLeaderboard() {
    try {
      const response = await fetch(`${API_URL}?action=get_leaderboard&game=viking2`);
      const items = await response.json();
      const listEl = document.getElementById("leaderboardList");
      listEl.innerHTML = "";
      
      listEl.style.background = "#5C673C";
      listEl.style.borderRadius = "6px";
      listEl.style.padding = "6px";

      if (!items || items.length === 0) {
        listEl.innerHTML = "<li style='text-align: center; color: #1e2319;'>No high scores yet. Be the first!</li>";
        cloudHighScore = 0;
        drawInitialScreen();
        return;
      }
      
      cloudHighScore = parseInt(items[0].score) || 0;

      items.forEach((item, idx) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.padding = "4px 6px";
        
        if (idx === 0) {
          li.style.color = "#d4af37"; // Gold
          li.style.fontWeight = "bold";
        } else if (idx === 1) {
          li.style.color = "#95a5a6"; // Silver
          li.style.fontWeight = "bold";
        } else if (idx === 2) {
          li.style.color = "#cd7f32"; // Bronze
          li.style.fontWeight = "bold";
        } else {
          li.style.color = "#1e2319";
        }
        
        const nameSpan = document.createElement("span");
        nameSpan.textContent = `${idx + 1}. ${item.playerName || item.name}`;
        
        const scoreSpan = document.createElement("span");
        scoreSpan.textContent = `${item.score} pts`;
        scoreSpan.style.fontWeight = "bold";

        li.appendChild(nameSpan);
        li.appendChild(scoreSpan);
        listEl.appendChild(li);
      });
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      document.getElementById("leaderboardList").innerHTML = "<li style='text-align: center; color: #1e2319;'>Could not load cloud leaderboard.</li>";
    }
    
    drawInitialScreen();
  }

  fetchLeaderboard();
}