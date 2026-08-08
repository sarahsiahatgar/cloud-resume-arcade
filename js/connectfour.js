// js/connectfour.js

export function initConnectFour() {
  let c4BoardState = Array(6).fill(null).map(() => Array(7).fill(0));
  let c4Active = false; 
  let c4Wins = 0;

  function initC4() {
    c4BoardState = Array(6).fill(null).map(() => Array(7).fill(0));
    c4Active = true;
    document.getElementById('c4Status').textContent = 'Your turn! (Green)';
    renderC4();
  }

  function renderC4Preview() {
    c4BoardState[5][2] = 1; 
    c4BoardState[5][3] = 2; 
    c4BoardState[4][3] = 1; 
    c4BoardState[5][4] = 2; 
    renderC4();
  }

  function renderC4() {
    const boardEl = document.getElementById('c4Board');
    boardEl.innerHTML = '';
    
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const cell = document.createElement('div');
        cell.classList.add('c4-cell');
        
        if (c4BoardState[r][c] === 1) cell.classList.add('player');
        if (c4BoardState[r][c] === 2) cell.classList.add('ai');
        
        cell.addEventListener('click', () => {
          if (!c4Active) initC4(); 
          playC4(c);
        });
        
        boardEl.appendChild(cell);
      }
    }
  }

  function playC4(col) {
    if (!c4Active) return;
    
    for (let r = 5; r >= 0; r--) {
      if (c4BoardState[r][col] === 0) {
        c4BoardState[r][col] = 1;
        renderC4();
        
        if (checkC4Win(1)) {
          document.getElementById('c4Status').textContent = '🎉 You won Connect Four!';
          c4Active = false;
          c4Wins++;
          document.getElementById('c4Score').textContent = c4Wins;
          return;
        }
        
        document.getElementById('c4Status').textContent = "Nova AI is thinking...";
        aiC4Move();
        return;
      }
    }
  }

  async function aiC4Move() {
    if (!c4Active) return;
    
    try {
      const response = await fetch('/api/ai', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "connectfour", boardState: c4BoardState })
      });

      const data = await response.json();
      const col = data.column;

      if (c4Active && col !== undefined && col >= 0 && col < 7 && c4BoardState[0][col] === 0) {
        for (let r = 5; r >= 0; r--) {
          if (c4BoardState[r][col] === 0) {
            c4BoardState[r][col] = 2;
            renderC4();
            
            if (checkC4Win(2)) {
              document.getElementById('c4Status').textContent = '🤖 AI won Connect Four!';
              c4Active = false;
            } else {
              document.getElementById('c4Status').textContent = 'Your turn! (Green)';
            }
            return;
          }
        }
      } else {
        fallbackC4RandomMove();
      }
    } catch (err) {
      console.error("Connect Four AI error, using fallback:", err);
      fallbackC4RandomMove();
    }
  }

  function fallbackC4RandomMove() {
    const validCols = [];
    for (let c = 0; c < 7; c++) {
      if (c4BoardState[0][c] === 0) validCols.push(c);
    }
    if (validCols.length > 0) {
      const col = validCols[Math.floor(Math.random() * validCols.length)];
      for (let r = 5; r >= 0; r--) {
        if (c4BoardState[r][col] === 0) {
          c4BoardState[r][col] = 2;
          renderC4();
          document.getElementById('c4Status').textContent = 'Your turn! (Green)';
          return;
        }
      }
    }
  }

  function checkC4Win(p) {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        if (c + 3 < 7 && p === c4BoardState[r][c] && p === c4BoardState[r][c+1] && p === c4BoardState[r][c+2] && p === c4BoardState[r][c+3]) return true;
        if (r + 3 < 6 && p === c4BoardState[r][c] && p === c4BoardState[r+1][c] && p === c4BoardState[r+2][c] && p === c4BoardState[r+3][c]) return true;
        if (r + 3 < 6 && c + 3 < 7 && p === c4BoardState[r][c] && p === c4BoardState[r+1][c+1] && p === c4BoardState[r+2][c+2] && p === c4BoardState[r+3][c+3]) return true;
        if (r + 3 < 6 && c - 3 >= 0 && p === c4BoardState[r][c] && p === c4BoardState[r+1][c-1] && p === c4BoardState[r+2][c-2] && p === c4BoardState[r+3][c-3]) return true;
      }
    }
    return false;
  }

  renderC4Preview();
  document.getElementById('restartC4Btn').addEventListener('click', initC4);
}