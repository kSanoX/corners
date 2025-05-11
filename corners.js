const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const endTurnBtn = document.getElementById('endTurnBtn');
    endTurnBtn.addEventListener('click', () => {
      selected = null;
      endTurn();
    });

    const size = 8;
    let board = [];
    let selected = null;
    let currentPlayer = 1;
    let hasJumpedYet = false;

    function createBoard() {
      board = Array.from({ length: size }, () => Array(size).fill(null));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) board[r][c] = 1;
      for (let r = size - 3; r < size; r++) for (let c = size - 4; c < size; c++) board[r][c] = 2;
    }

    function renderBoard() {
      boardEl.innerHTML = '';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.row = r;
          cell.dataset.col = c;

          const piece = board[r][c];
          if (piece) {
            const el = document.createElement('div');
            el.className = `piece player${piece}`;
            if (selected && selected.r == r && selected.c == c) el.classList.add('selected');
            cell.appendChild(el);
          }

          cell.addEventListener('click', onCellClick);
          boardEl.appendChild(cell);
        }
      }

      endTurnBtn.disabled = !selected;
    }

    function onCellClick(e) {
        const r = parseInt(e.currentTarget.dataset.row);
        const c = parseInt(e.currentTarget.dataset.col);
        const piece = board[r][c];
      
        if (selected) {
          if (isValidJump(selected.r, selected.c, r, c)) {
           
            board[r][c] = currentPlayer;
            board[selected.r][selected.c] = null;
            selected = { r, c };
      
            
            if (getAvailableJumps(r, c).length === 0) {
              endTurnBtn.disabled = false;
            } else {
              endTurnBtn.disabled = false;
            }
            hasJumpedYet = true
          } else if (!hasJumpedYet && isValidMove(selected.r, selected.c, r, c)) {
            board[r][c] = currentPlayer;
            board[selected.r][selected.c] = null;
            selected = null;
            endTurn();
          } else {
            selected = null;
          }
        } else if (piece === currentPlayer) {
          selected = { r, c };
        }
      
        renderBoard();
      }
      

      function endTurn() {
        hasJumpedYet = false;
        endTurnBtn.disabled = true;
        selected = null;
      
        if (checkWin(currentPlayer)) {
          statusEl.textContent = `Виграв гравецт ${currentPlayer}!`;
          boardEl.style.pointerEvents = 'none';
        } else {
          currentPlayer = 3 - currentPlayer;
          statusEl.textContent = `Ход гравця ${currentPlayer} (${currentPlayer === 1 ? 'червоний' : 'синій'})`;
        }
      }
      

    function isValidMove(r1, c1, r2, c2) {
      const dr = Math.abs(r2 - r1);
      const dc = Math.abs(c2 - c1);
      return (dr + dc === 1) && !board[r2][c2];
    }

    function isValidJump(fromR, fromC, toR, toC) {
        const dr = toR - fromR;
        const dc = toC - fromC;
        if (Math.abs(dr) !== 2 && Math.abs(dc) !== 2) return false;
      
        const midR = fromR + dr / 2;
        const midC = fromC + dc / 2;
      
        return (
          midR >= 0 && midR < size &&
          midC >= 0 && midC < size &&
          board[midR][midC] !== null && 
          board[toR][toC] === null
        );
      }
      

    function getAvailableJumps(r, c, visited = new Set()) {
      const jumps = [];
      const key = `${r},${c}`;
      if (visited.has(key)) return [];
      visited.add(key);

      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ];

      for (const [dr, dc] of directions) {
        const midR = r + dr;
        const midC = c + dc;
        const landingR = r + dr * 2;
        const landingC = c + dc * 2;

        if (
          landingR >= 0 && landingR < size &&
          landingC >= 0 && landingC < size &&
          board[midR]?.[midC] !== null &&
          board[midR][midC] !== currentPlayer &&
          board[landingR][landingC] === null
        ) {
          const landingKey = `${landingR},${landingC}`;
          if (!visited.has(landingKey)) {
            jumps.push({ r: landingR, c: landingC });
            jumps.push(...getAvailableJumps(landingR, landingC, new Set(visited)));
          }
        }
      }

      return jumps;
    }

    function checkWin(player) {
      const target = player === 1
        ? { rows: [5, 6, 7], cols: [4, 5, 6, 7] }
        : { rows: [0, 1, 2], cols: [0, 1, 2, 3] };

      let count = 0;
      for (let r of target.rows) {
        for (let c of target.cols) {
          if (board[r][c] === player) count++;
        }
      }

      return count === 12;
    }

    createBoard();
    renderBoard();