export function initGorillaGame() {
    const canvas = document.getElementById('gorillaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const SCREEN_WIDTH = 280;
    const SCREEN_HEIGHT = 200;

    let hudContainer = document.getElementById('gorillaHud');
    if (!hudContainer) {
        hudContainer = document.createElement('div');
        hudContainer.id = 'gorillaHud';
        hudContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; width: 280px; margin-bottom: 5px; font-family: monospace; font-size: 11px; font-weight: bold; color: #e5e7eb;';
        hudContainer.innerHTML = `
            <div>YOU: <span id="playerLivesDisplay">🍌 🍌 🍌</span></div>
            <div id="windDisplay" style="color: #38bdf8;">WIND: Calm</div>
            <div>AI: <span id="aiLivesDisplay">🍌 🍌 🍌</span></div>
        `;
        canvas.parentNode.insertBefore(hudContainer, canvas);
    }

    const startSound = new Audio('sound/gorillasound.m4a'); 
    startSound.loop = false; 
    let isMuted = false;

    function playStartSound() {
        if (isMuted) return;
        startSound.pause();      
        startSound.currentTime = 0; 
        startSound.play().catch(e => {
            console.log("Audio playback prevented by browser policy:", e);
        });
    }

    class Building {
        constructor(x, width, height) {
            this.x = x;
            this.width = width;
            this.height = height;
            this.currentHeight = height;
            
            const colors = ['#233142', '#2c3e50', '#1f3a40', '#342828', '#2d2d30'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            this.windows = [];
            for (let wx = x + 4; wx < x + width - 6; wx += 10) {
                for (let wy = SCREEN_HEIGHT - height + 5; wy < SCREEN_HEIGHT - 10; wy += 15) {
                    if (Math.random() > 0.3) {
                        this.windows.push({ x: wx, y: wy, w: 5, h: 9 });
                    }
                }
            }
        }

        draw(ctx) {
            const currentY = SCREEN_HEIGHT - this.currentHeight;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, currentY, this.width, this.currentHeight);

            ctx.fillStyle = '#ffdc00';
            for (let w of this.windows) {
                if (w.y >= currentY) {
                    ctx.fillRect(w.x, w.y, w.w, w.h);
                }
            }
        }
    }

    class GorillaGame {
        constructor() {
            this.planets = [
                { name: 'Earth', gravity: 9.8 },
                { name: 'Moon', gravity: 1.6 },
                { name: 'Mars', gravity: 3.7 },
                { name: 'Jupiter', gravity: 24.8 }
            ];
            this.planetIndex = 0;
            this.gravity = this.planets[this.planetIndex].gravity;
            
            this.buildings = [];
            this.difficulty = 'Normal';
            this.particles = [];
            
            this.wind = 0;
            this.generateWind();
            this.generateCity();

            this.g1_building = this.buildings[1];
            this.g2_building = this.buildings[this.buildings.length - 2];

            this.g1_pos = [this.g1_building.x + this.g1_building.width / 2, SCREEN_HEIGHT - this.g1_building.currentHeight];
            this.g2_pos = [this.g2_building.x + this.g2_building.width / 2, SCREEN_HEIGHT - this.g2_building.currentHeight];

            this.turn = 1; 
            this.score = 0;
            this.playerLives = 3;
            this.aiLives = 3;
            this.isPlaying = false;
            this.banana = null;
            this.message = "Press Start to begin!";
            this.frame = 0;

            this.aiVelocityOffset = 0;
            this.aiAngleOffset = 0;

            this.sunMood = 'happy';
            this.celebratingGorilla = null; 
            this.celebrationTimer = 0;

            this.updateLivesDisplay();
            this.updateWindDisplay();
        }
        
        cyclePlanet() {
            this.planetIndex = (this.planetIndex + 1) % this.planets.length;
            this.gravity = this.planets[this.planetIndex].gravity;
            return this.planets[this.planetIndex];
        }

        generateWind() {
            let maxWind = 6;
            this.wind = Math.floor(Math.random() * (maxWind * 2 + 1)) - maxWind;
            this.updateWindDisplay();
        }

        generateCity() {
            this.buildings = [];
            let widthCursor = 0;
            while (widthCursor < SCREEN_WIDTH) {
                let w = Math.floor(Math.random() * 25) + 30;
                let h = Math.floor(Math.random() * 80) + 60;
                if (widthCursor + w > SCREEN_WIDTH) {
                    w = SCREEN_WIDTH - widthCursor;
                }
                this.buildings.push(new Building(widthCursor, w, h));
                widthCursor += w;
            }

            [1, this.buildings.length - 2].forEach(idx => {
                if (this.buildings[idx]) {
                    this.buildings[idx].currentHeight = Math.min(this.buildings[idx].currentHeight, 90);
                }
            });
        }

        resetGame() {
            this.score = 0;
            this.playerLives = 3;
            this.aiLives = 3;
            
            this.aiVelocityOffset = 0;
            this.aiAngleOffset = 0;

            document.getElementById('gorillaScore').textContent = '0';
            this.updateLivesDisplay();

            this.resetRound();
            this.message = "Your turn! Throw your banana.";
        }

        resetRound() {
            this.generateWind();
            this.generateCity();
            this.g1_building = this.buildings[1];
            this.g2_building = this.buildings[this.buildings.length - 2];
            
            this.g1_pos = [this.g1_building.x + this.g1_building.width / 2, SCREEN_HEIGHT - this.g1_building.currentHeight];
            this.g2_pos = [this.g2_building.x + this.g2_building.width / 2, SCREEN_HEIGHT - this.g2_building.currentHeight];
            
            this.banana = null;
            this.turn = 1;
            this.sunMood = 'happy'; 
            this.celebratingGorilla = null;
            this.celebrationTimer = 0;
            this.message = "Your turn! Throw your banana.";
        }

        updateLivesDisplay() {
            const pDisplay = document.getElementById('playerLivesDisplay');
            const aiDisplay = document.getElementById('aiLivesDisplay');
            if (pDisplay) pDisplay.textContent = '🍌 '.repeat(Math.max(0, this.playerLives)).trim() || '❌';
            if (aiDisplay) aiDisplay.textContent = '🍌 '.repeat(Math.max(0, this.aiLives)).trim() || '❌';
        }

        updateWindDisplay() {
            const windEl = document.getElementById('windDisplay');
            if (windEl) {
                if (this.wind === 0) {
                    windEl.textContent = "WIND: Calm";
                } else {
                    const dir = this.wind > 0 ? "➔ Right" : "⬅ Left";
                    windEl.textContent = `WIND: ${Math.abs(this.wind)} ${dir}`;
                }
            }
        }

        launchBanana(angleDeg, velocity) {
            if (this.banana) return;
            const angleRad = angleDeg * (Math.PI / 180);
            let vx, vy, startPos;

            if (this.turn === 1) {
                vx = velocity * Math.cos(angleRad);
                vy = -velocity * Math.sin(angleRad);
                startPos = [this.g1_pos[0] + 8, this.g1_pos[1] - 10];
            } else {
                vx = -velocity * Math.cos(angleRad);
                vy = -velocity * Math.sin(angleRad);
                startPos = [this.g2_pos[0] - 8, this.g2_pos[1] - 10];
            }

            this.banana = { 
                pos: startPos, 
                vel: [vx, vy], 
                rotation: 0, 
                thrower: this.turn,
                startX: startPos[0],
                startY: startPos[1]
            };
        }

 
		triggerAITurn() {
			this.message = "AI-Gorilla is scanning the skyline...";
			
			fetch('/api/ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					game: "gorilla",
					aiPos: this.g2_pos,
					playerPos: this.g1_pos,
					wind: this.wind,
					difficulty: this.difficulty,
					buildings: this.buildings
				})
			})
			.then(res => res.json())
			.then(data => {
				if (!this.isPlaying) return;
				
				if (data.message) {
					this.message = `AI Gorilla: "${data.message}"`;
				}

				this.launchBanana(data.angle, data.velocity);
			})
			.catch(err => {
				console.error("AI fetch error:", err);
				this.launchBanana(60, 50); 
			});
		}
        
        createExplosion(x, y, isBig = false) {
            const count = isBig ? 30 : 15;
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 1;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 2 + 1,
                    color: ['#ff4d4d', '#ff9933', '#ffff33', '#ffffff'][Math.floor(Math.random() * 4)],
                    alpha: 1,
                    decay: Math.random() * 0.03 + 0.02
                });
            }
        }
        
        updateBanana() {
            if (!this.banana || this.banana === "scored") return;

            const substeps = 4;
            const frameDt = 0.2;
            const dt = frameDt / substeps;

            for (let i = 0; i < substeps; i++) {
                if (this.banana === "scored") return;

                this.banana.vel[0] += (this.wind * 0.05) / substeps;
                this.banana.vel[1] += this.gravity * dt;

                this.banana.pos[0] += this.banana.vel[0] * dt;
                this.banana.pos[1] += this.banana.vel[1] * dt;
                this.banana.rotation += (Math.abs(this.banana.vel[0]) * 0.03) / substeps;

                const bx = this.banana.pos[0];
                const by = this.banana.pos[1];

                if (bx < 0 || bx > SCREEN_WIDTH || by > SCREEN_HEIGHT + 20) {
                    this.createExplosion(Math.max(0, Math.min(SCREEN_WIDTH, bx)), Math.min(SCREEN_HEIGHT, by), false);
                    this.processAIMiss(bx, false);
                    this.switchTurns();
                    return;
                }

                const distFromStart = Math.hypot(bx - this.banana.startX, by - this.banana.startY);
                const canHitGorillas = distFromStart > 25;

                const g1Rect = { x: this.g1_pos[0] - 14, y: this.g1_pos[1] - 22, w: 28, h: 28 };
                const g2Rect = { x: this.g2_pos[0] - 14, y: this.g2_pos[1] - 22, w: 28, h: 28 };

                if (canHitGorillas) {
                    if (bx >= g1Rect.x && bx <= g1Rect.x + g1Rect.w && by >= g1Rect.y && by <= g1Rect.y + g1Rect.h) {
                        this.createExplosion(this.g1_pos[0], this.g1_pos[1] - 10, true);
                        const thrower = this.banana.thrower;
                        this.playerLives--;
                        this.updateLivesDisplay();
                        this.banana = "scored";

                        this.sunMood = 'sad';
                        this.celebratingGorilla = 2; 
                        this.celebrationTimer = 90; 

                        if (this.playerLives <= 0) {
                            this.message = thrower === 1 ? "You hit yourself and lost all lives! Game Over." : "AI-Gorilla eliminated you! Game Over.";
                            this.isPlaying = false;
                        } else {
                            this.message = thrower === 1 ? "Ouch! You hit yourself (-1 Life)." : "Ouch! AI-Gorilla hit you (-1 Life).";
                            setTimeout(() => { if (this.isPlaying) this.resetRound(); }, 2000);
                        }
                        return;
                    } 
                    else if (bx >= g2Rect.x && bx <= g2Rect.x + g2Rect.w && by >= g2Rect.y && by <= g2Rect.y + g2Rect.h) {
                        this.createExplosion(this.g2_pos[0], this.g2_pos[1] - 10, true);
                        const thrower = this.banana.thrower;
                        this.aiLives--;
                        this.updateLivesDisplay();
                        this.banana = "scored";

                        this.sunMood = 'happy';
                        if (thrower === 1) {
                            this.celebratingGorilla = 1; 
                            this.celebrationTimer = 90;
                        }

                        if (this.aiLives <= 0) {
                            this.message = thrower === 2 ? "AI-Gorilla eliminated itself! You Win!" : "Direct Hit! AI-Gorilla eliminated! You Win!";
                            this.score += 100;
                            document.getElementById('gorillaScore').textContent = this.score;
                            this.isPlaying = false;
                        } else {
                            if (thrower === 2) {
                                this.message = "AI-Gorilla hit itself (-1 Life)!";
                            } else {
                                this.message = "Direct Hit! AI-Gorilla lost a life.";
                                this.score += 100;
                            }
                            document.getElementById('gorillaScore').textContent = this.score;
                            setTimeout(() => { if (this.isPlaying) this.resetRound(); }, 2000);
                        }
                        return;
                    }
                }

                for (let b of this.buildings) {
                    const currentY = SCREEN_HEIGHT - b.currentHeight;
                    if (bx >= b.x && bx <= b.x + b.width && by >= currentY && by <= SCREEN_HEIGHT) {
                        this.createExplosion(bx, by, false);
                        this.processAIMiss(bx, true);
                        this.message = "Ouch! Hit building.";
                        this.switchTurns();
                        return;
                    }
                }
            }
        }

        processAIMiss(landingX, hitBuilding = false) {
            if (this.banana && this.banana.thrower === 2) {
                const playerX = this.g1_pos[0];
                const error = landingX - playerX;

                if (hitBuilding) {
                    this.aiVelocityOffset += 6;
                    this.aiAngleOffset += 5;
                } else if (error < 0) {
                    this.aiVelocityOffset -= error * 0.15;
                    this.aiAngleOffset += 3;
                } else {
                    this.aiVelocityOffset -= error * 0.15;
                    this.aiAngleOffset -= 2;
                }

                this.aiVelocityOffset = Math.max(-30, Math.min(30, this.aiVelocityOffset));
                this.aiAngleOffset = Math.max(-20, Math.min(25, this.aiAngleOffset));
            }
        }

        switchTurns() {
            this.banana = null;
            this.turn = this.turn === 1 ? 2 : 1;
            if (this.turn === 2) {
                this.triggerAITurn();
            } else {
                this.message = "Your turn!";
            }
        }

        draw(ctx) {
            let skyColor = '#111827'; 
            const planetName = this.planets[this.planetIndex].name;
            if (planetName === 'Moon') {
                skyColor = '#030712'; 
            } else if (planetName === 'Mars') {
                skyColor = '#2d1512'; 
            } else if (planetName === 'Jupiter') {
                skyColor = '#432818'; 
            }

            ctx.fillStyle = skyColor;
            ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            this.frame++;

            if (this.celebrationTimer > 0) {
                this.celebrationTimer--;
                if (this.celebrationTimer === 0) {
                    this.celebratingGorilla = null;
                }
            }

            ctx.save();
            ctx.fillStyle = '#ffffff';
            let starCount = (planetName === 'Moon') ? 8 : 25;
            for (let i = 0; i < starCount; i++) {
                let sx = (i * 37) % SCREEN_WIDTH;
                let sy = (i * 23) % (SCREEN_HEIGHT / 2);
                ctx.globalAlpha = (i % 2 === 0) ? 0.8 : 0.4;
                ctx.fillRect(sx, sy, 1.5, 1.5);
            }
            ctx.restore();

            ctx.save();
            const objX = SCREEN_WIDTH / 2;
            const objY = 22;

            if (planetName === 'Earth') {
                const sunRadius = 12;
                ctx.fillStyle = this.sunMood === 'sad' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(252, 211, 77, 0.2)';
                ctx.beginPath();
                ctx.arc(objX, objY, sunRadius + 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = this.sunMood === 'sad' ? '#64748b' : '#f59e0b';
                ctx.beginPath();
                ctx.arc(objX, objY, sunRadius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(objX - 3, objY - 2, 1.5, 0, Math.PI * 2);
                ctx.arc(objX + 3, objY - 2, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#78350f';
                ctx.fill();

                ctx.beginPath();
                if (this.sunMood === 'sad') {
                    ctx.arc(objX, objY + 5, 3, Math.PI, Math.PI * 2, false);
                } else {
                    ctx.arc(objX, objY + 2, 3, 0, Math.PI, false);
                }
                ctx.stroke();

            } else if (planetName === 'Moon') {
                ctx.fillStyle = '#1e3a8a';
                ctx.beginPath();
                ctx.arc(objX, objY, 11, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(objX - 3, objY - 2, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillRect(objX - 5, objY + 2, 8, 2);

            } else if (planetName === 'Mars') {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                ctx.beginPath();
                ctx.arc(objX, objY, 16, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#dc2626';
                ctx.beginPath();
                ctx.arc(objX, objY, 11, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#991b1b';
                ctx.beginPath();
                ctx.arc(objX - 3, objY - 3, 3, 0, Math.PI * 2);
                ctx.arc(objX + 4, objY + 2, 2, 0, Math.PI * 2);
                ctx.fill();

            } else if (planetName === 'Jupiter') {
                ctx.save();
                ctx.beginPath();
                ctx.arc(objX, objY, 14, 0, Math.PI * 2);
                ctx.clip();

                ctx.fillStyle = '#d97706';
                ctx.fillRect(objX - 15, objY - 15, 30, 30);

                ctx.fillStyle = '#b45309';
                ctx.fillRect(objX - 15, objY - 6, 30, 4);
                ctx.fillRect(objX - 15, objY + 4, 30, 3);

                ctx.fillStyle = '#78350f';
                ctx.fillRect(objX - 15, objY - 1, 30, 3);

                ctx.fillStyle = '#991b1b';
                ctx.beginPath();
                ctx.ellipse(objX + 3, objY + 3, 4, 2.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();

            for (let b of this.buildings) {
                b.draw(ctx);
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                let p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                } else {
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }

            const drawCartoonGorilla = (pos, isPlayer) => {
                const x = pos[0];
                const y = pos[1]; 
                const veryDarkYellow = '#6b5500';

                let isCelebratingThis = (this.celebratingGorilla === 1 && isPlayer) || (this.celebratingGorilla === 2 && !isPlayer);
                let rightArmOffset = 0;
                let leftArmOffset = 0;

                if (isCelebratingThis) {
                    const cycleProgress = (90 - this.celebrationTimer) / 90; 
                    const wavePhase = (cycleProgress * 4) % 2; 
                    if (wavePhase < 1) {
                        rightArmOffset = -12;
                    } else {
                        leftArmOffset = -12;
                    }
                }

                ctx.save();
                ctx.translate(x, y);
                if (!isPlayer) ctx.scale(-1, 1);
                ctx.scale(0.6, 0.6);

                ctx.fillStyle = veryDarkYellow;
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.bezierCurveTo(-20, -15, -15, -30, 0, -30);
                ctx.bezierCurveTo(15, -30, 20, -15, 15, 0);
                ctx.fill();
                
                ctx.fillStyle = '#b7950b';
                ctx.beginPath();
                ctx.arc(0, -15, 10, Math.PI, Math.PI*2);
                ctx.fill();

                ctx.fillStyle = veryDarkYellow;
                ctx.beginPath();
                ctx.arc(0, -32, 12, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#f9e79f';
                ctx.beginPath();
                ctx.ellipse(0, -28, 8, 6, 0, 0, Math.PI*2);
                ctx.fill();
                
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(-4, -34, 3, 0, Math.PI*2);
                ctx.arc(4, -34, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(-3, -34, 1.5, 0, Math.PI*2);
                ctx.arc(3, -34, 1.5, 0, Math.PI*2);
                ctx.fill();

                ctx.strokeStyle = veryDarkYellow;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(-12, -18);
                ctx.lineTo(-18, -25 + leftArmOffset);
                ctx.stroke();
                
                ctx.fillStyle = veryDarkYellow;
                ctx.beginPath();
                ctx.arc(-18, -25 + leftArmOffset, 4, 0, Math.PI*2);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(12, -18);
                ctx.lineTo(20, -25 + rightArmOffset);
                ctx.stroke();
                
                ctx.fillStyle = veryDarkYellow;
                ctx.beginPath();
                ctx.arc(20, -25 + rightArmOffset, 4, 0, Math.PI*2);
                ctx.fill();

                ctx.restore();
            };

            drawCartoonGorilla(this.g1_pos, true);
            drawCartoonGorilla(this.g2_pos, false);

            if (this.banana && this.banana !== "scored") {
                const bx = this.banana.pos[0];
                const by = this.banana.pos[1];

                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(this.banana.rotation); 

                ctx.fillStyle = '#ffe066';
                ctx.strokeStyle = '#9a7b0c';
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(-7, -3);
                ctx.bezierCurveTo(-3, -9, 5, -9, 7, -3);
                ctx.bezierCurveTo(3, -5, -3, -5, -7, -3);
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
        }
    }

    const game = new GorillaGame();

    const angleInput = document.getElementById('angleInput');
    const powerInput = document.getElementById('powerInput');
    const fireBtn = document.getElementById('gorillaFireBtn');
    const restartBtn = document.getElementById('gorillaMainActionBtn');
    const soundBtn = document.getElementById('gorillaSoundBtn');
    const planetBtn = document.getElementById('gorillaPlanetBtn');
    const statusDiv = document.getElementById('gorillaStatus');

    function setPlanetButtonState(disabled) {
        if (!planetBtn) return;
        planetBtn.disabled = disabled;
        planetBtn.style.opacity = disabled ? '0.4' : '1';
        planetBtn.style.cursor = disabled ? 'not-allowed' : 'pointer';
    }

    if (planetBtn) {
        planetBtn.textContent = `Earth (g: 9.8)`;
        planetBtn.addEventListener('click', () => {
            if (game.isPlaying) return; 
            const planet = game.cyclePlanet();
            planetBtn.textContent = `${planet.name} (g: ${planet.gravity})`;
        });
    }

    soundBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        soundBtn.textContent = isMuted ? '🔇' : '🔊';
        if (isMuted) {
            startSound.pause();
        }
    });

    fireBtn.addEventListener('click', () => {
        if (!game.isPlaying) {
            game.isPlaying = true;
            game.resetGame();
            playStartSound();
            fireBtn.textContent = "Throw 🍌";
            game.message = "Your turn! Throw your banana.";
            setPlanetButtonState(true); 
        } else {
            if (game.turn === 1 && !game.banana) {
                game.launchBanana(parseInt(angleInput.value, 10) || 45, parseInt(powerInput.value, 10) || 50);
                game.message = "Banana in flight...";
            }
        }
    });

    restartBtn.addEventListener('click', () => {
        game.isPlaying = false;
        fireBtn.textContent = "Start";
        setPlanetButtonState(false);
        game.message = "Press Start to begin!";
        statusDiv.textContent = game.message;
    });

    function loop() {
        if (game.isPlaying) {
            if (game.banana && game.banana !== "scored") {
                game.updateBanana();
            }
            statusDiv.textContent = game.message;
            if (!game.isPlaying) {
                setPlanetButtonState(false);
                if (fireBtn) fireBtn.textContent = "Start";
            }
        }
        game.draw(ctx);
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}