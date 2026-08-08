export function initRaindropGame() {
    const canvas = document.getElementById("raindropCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    let score = 0;
    let waterLevel = 0;
    const maxWater = 80;
    let drops = [];
    let clouds = [];
    let isPlaying = false;
    let difficulty = "Easy";
    let normalDropsSinceGolden = 0;

    const scoreEl = document.getElementById("raindropScore");
    const statusEl = document.getElementById("raindropStatus");
    const inputEl = document.getElementById("raindropAnswerInput");
    const submitBtn = document.getElementById("raindropSubmitBtn");
    const difficultyBtn = document.getElementById("raindropDifficultyBtn");
    const mainActionBtn = document.getElementById("raindropMainActionBtn");

    class Raindrop {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * (WIDTH - 100) + 50;
            this.y = -40;

            let isUnique = false;
            let safetyCounter = 0;

            while (!isUnique && safetyCounter < 20) {
                safetyCounter++;

                if (waterLevel >= 25 && normalDropsSinceGolden >= 6 && Math.random() < 0.25) {
                    this.isGolden = true;
                    normalDropsSinceGolden = 0;
                } else {
                    this.isGolden = false;
                    normalDropsSinceGolden++;
                }

                if (difficulty === "Easy") {
                    this.speed = this.isGolden ? 0.4 : (Math.random() * 0.3 + 0.4);
                } else if (difficulty === "Normal") {
                    this.speed = this.isGolden ? 0.6 : (Math.random() * 0.5 + 0.6);
                } else {
                    this.speed = this.isGolden ? 0.9 : (Math.random() * 0.9 + 1.1);
                }

                if (this.isGolden) {
                    const goldOps = (difficulty === "Easy") ? ['+', '-'] : ['+', '-', '*'];
                    const op1 = goldOps[Math.floor(Math.random() * goldOps.length)];
                    const op2 = goldOps[Math.floor(Math.random() * goldOps.length)];

                    this.num1 = Math.floor(Math.random() * 5) + 1;
                    this.num2 = Math.floor(Math.random() * 5) + 1;
                    this.num3 = Math.floor(Math.random() * 5) + 1;

                    let part1 = eval(`${this.num1} ${op1} ${this.num2}`);
                    this.answer = eval(`${part1} ${op2} ${this.num3}`);

                    if (!Number.isInteger(this.answer) || this.answer < 0 || this.answer > 50) {
                        this.num1 = Math.floor(Math.random() * 4) + 1;
                        this.num2 = Math.floor(Math.random() * 4) + 1;
                        this.num3 = Math.floor(Math.random() * 4) + 1;
                        this.answer = this.num1 + this.num2 + this.num3;
                        this.text = `${this.num1} + ${this.num2} + ${this.num3}`;
                    } else {
                        this.text = `${this.num1} ${op1} ${this.num2} ${op2} ${this.num3}`;
                    }
                } else {
                    let ops;
                    if (difficulty === "Easy") {
                        ops = ['+', '-'];
                    } else {
                        ops = ['+', '-', '*', '/'];
                    }

                    const op = ops[Math.floor(Math.random() * ops.length)];
                    
                    if (op === '+') {
                        this.num1 = Math.floor(Math.random() * 10) + 1;
                        this.num2 = Math.floor(Math.random() * 10) + 1;
                        this.answer = this.num1 + this.num2;
                    } else if (op === '-') {
                        this.num1 = Math.floor(Math.random() * 12) + 4;
                        this.num2 = Math.floor(Math.random() * this.num1);
                        this.answer = this.num1 - this.num2;
                    } else if (op === '*') {
                        this.num1 = Math.floor(Math.random() * 6) + 1;
                        this.num2 = Math.floor(Math.random() * 6) + 1;
                        this.answer = this.num1 * this.num2;
                    } else {
                        this.num2 = Math.floor(Math.random() * 5) + 1;
                        this.answer = Math.floor(Math.random() * 6) + 1;
                        this.num1 = this.num2 * this.answer;
                    }

                    this.text = `${this.num1} ${op} ${this.num2}`;
                }

                let duplicate = drops.some(d => d && d !== this && d.answer === this.answer);
                if (!duplicate) {
                    isUnique = true;
                }
            }
        }

        update() {
            this.y += this.speed;
            if (this.y >= HEIGHT - 15 - waterLevel) {
                waterLevel += 12;
                this.reset();
            }
        }

        draw() {
            if (this.isGolden) {
                ctx.fillStyle = "#FFD700";
                ctx.beginPath();
                ctx.arc(this.x, this.y, 19, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#FFA500";
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.strokeStyle = "#FFC000";
                ctx.lineWidth = 2.5;
                for (let i = 0; i < 8; i++) {
                    const angle = (i * Math.PI) / 4;
                    const x1 = this.x + Math.cos(angle) * 21;
                    const y1 = this.y + Math.sin(angle) * 21;
                    const x2 = this.x + Math.cos(angle) * 28;
                    const y2 = this.y + Math.sin(angle) * 28;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }

                ctx.fillStyle = "#5a3a00";
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.text, this.x, this.y);

            } else {
                ctx.fillStyle = "#1E90FF";
                let wFactor = 22;
                let hFactor = 24;

                ctx.beginPath();
                ctx.moveTo(this.x, this.y - hFactor);
                ctx.bezierCurveTo(this.x + wFactor, this.y + 4, this.x + wFactor, this.y + 18, this.x, this.y + 18);
                ctx.bezierCurveTo(this.x - wFactor, this.y + 18, this.x - wFactor, this.y + 4, this.x, this.y - hFactor);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 10px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.text, this.x, this.y);
            }
        }
    }

    function drawCloud(cx, cy) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.arc(cx + 9, cy - 4, 12, 0, Math.PI * 2);
        ctx.arc(cx + 20, cy, 9, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    function drawIsland() {
        const islandX = WIDTH - 45;
        const islandY = HEIGHT - maxWater;

        ctx.fillStyle = "#D2B48C";
        ctx.beginPath();
        ctx.ellipse(islandX, islandY + 6, 32, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(islandX - 8, islandY);
        ctx.quadraticCurveTo(islandX - 12, islandY - 22, islandX - 4, islandY - 32);
        ctx.stroke();

        ctx.fillStyle = "#1E7E34";
        ctx.beginPath();
        ctx.arc(islandX - 4, islandY - 32, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#2ECC71";
        ctx.beginPath();
        ctx.arc(islandX - 12, islandY - 34, 9, 0, Math.PI * 2);
        ctx.arc(islandX + 4, islandY - 34, 9, 0, Math.PI * 2);
        ctx.arc(islandX - 4, islandY - 40, 9, 0, Math.PI * 2);
        ctx.arc(islandX - 8, islandY - 28, 8, 0, Math.PI * 2);
        ctx.arc(islandX + 2, islandY - 28, 8, 0, Math.PI * 2);
        ctx.fill();

        const humanX = islandX + 12;
        const humanY = islandY - 2;

        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(humanX, humanY - 18, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(humanX, humanY - 13);
        ctx.lineTo(humanX, humanY - 5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(humanX - 5, humanY - 10);
        ctx.lineTo(humanX + 5, humanY - 10);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(humanX, humanY - 5);
        ctx.lineTo(humanX - 4, humanY);
        ctx.moveTo(humanX, humanY - 5);
        ctx.lineTo(humanX + 4, humanY);
        ctx.stroke();
    }

	function initGame() {
        score = 0;
        waterLevel = 0;
        normalDropsSinceGolden = 0;
        scoreEl.textContent = score;
        inputEl.value = "";
        inputEl.disabled = false;
        
        drops = [];
        drops.push(new Raindrop());
        drops.push(new Raindrop());
        
        clouds = [];
        const cloudCount = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < cloudCount; i++) {
            clouds.push({
                x: Math.random() * (WIDTH - 120) + 25,
                y: Math.random() * 60 + 20
            });
        }

        statusEl.textContent = "Solve equations! Watch water levels!";
        
        if (window.innerWidth > 768) {
            inputEl.focus();
        }
    }

    function checkAnswer() {
        if (!isPlaying) return;
        const val = parseInt(inputEl.value, 10);
        if (isNaN(val)) return;

        let matched = false;
        for (let drop of drops) {
            if (drop.answer === val) {
                if (drop.isGolden) {
                    score += 30;
                    waterLevel = Math.max(0, waterLevel - 25);
                    statusEl.textContent = "☀️ Sun Drop! Water Lowered! +30 pts";
                } else {
                    score += 10;
                    statusEl.textContent = "Correct! +10 pts";
                }
                scoreEl.textContent = score;
                drop.reset();
                matched = true;
                break;
            }
        }
        if (!matched) {
            waterLevel += 8;
            statusEl.textContent = "Wrong! Water rising...";
        }
        inputEl.value = "";
        if (window.innerWidth > 768) {
            inputEl.focus();
        }
    }

    submitBtn.addEventListener("click", checkAnswer);
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            checkAnswer();
        }
    });

    difficultyBtn.addEventListener("click", () => {
        if (difficulty === "Easy") {
            difficulty = "Normal";
        } else if (difficulty === "Normal") {
            difficulty = "Hard";
        } else {
            difficulty = "Easy";
        }
        difficultyBtn.textContent = difficulty;
    });

    mainActionBtn.addEventListener("click", () => {
        if (!isPlaying) {
            isPlaying = true;
            initGame();
            mainActionBtn.textContent = "Stop";
        } else {
            isPlaying = false;
            inputEl.disabled = true;
            statusEl.textContent = "Game Stopped. Press Start.";
            mainActionBtn.textContent = "Start";
        }
    });

    function gameLoop() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        const limitY = HEIGHT - maxWater;

        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, WIDTH, limitY);

        ctx.fillStyle = "#5499C7";
        ctx.fillRect(0, limitY, WIDTH, maxWater);

        for (let cloud of clouds) {
            drawCloud(cloud.x, cloud.y);
        }

        if (waterLevel >= maxWater && isPlaying) {
            isPlaying = false;
            inputEl.disabled = true;
            
            ctx.fillStyle = "#000080";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.fillStyle = "#DC143C";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20);

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "14px Arial";
            ctx.fillText(`Final Score: ${score}`, WIDTH / 2, HEIGHT / 2 + 10);
            
            statusEl.textContent = "Flooded! Game Over.";
            mainActionBtn.textContent = "Start";
            requestAnimationFrame(gameLoop);
            return;
        }

        drawIsland();

        const currentWaterHeight = waterLevel;
        ctx.fillStyle = "#1E90FF";
        ctx.fillRect(0, HEIGHT - currentWaterHeight, WIDTH, currentWaterHeight);

        if (isPlaying) {
            for (let drop of drops) {
                drop.update();
                drop.draw();
            }
        } else {
            ctx.fillStyle = "#2c3325";
            ctx.font = "13px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillText("Press Start to Play!", WIDTH / 2, HEIGHT / 2);
        }

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}