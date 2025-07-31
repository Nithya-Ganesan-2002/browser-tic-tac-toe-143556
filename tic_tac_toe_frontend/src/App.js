import React, { useState } from 'react';
import './App.css';

// --- Theme Colors (constants for inline styles) ---
const COLORS = {
  primary: "#1976d2",
  accent: "#ff7043",
  secondary: "#424242"
};

// --- Helper: Calculate Winner or Draw ---
/** PUBLIC_INTERFACE
 * Calculates the winner ("X" or "O") or determines if the board is a draw.
 * @param {string[]} squares - Array of 9 "X", "O", or null.
 * @returns {string|null} - Returns "X", "O", "draw", or null (if game ongoing).
 */
function calculateWinner(squares) {
  // All possible lines on the grid for win
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // Rows
    [0,3,6],[1,4,7],[2,5,8], // Columns
    [0,4,8],[2,4,6]          // Diagonals
  ];
  for (const [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
    ) {
      return squares[a];
    }
  }
  if (squares.every(Boolean)) return "draw";
  return null;
}

// --- Square Component ---
/** PUBLIC_INTERFACE
 * Renders a single square of the tic-tac-toe board.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      style={{
        color: value === "X" ? COLORS.primary : value === "O" ? COLORS.accent : COLORS.secondary,
        background: highlight ? "#f1f8fe" : "#fff",
        borderColor: highlight ? COLORS.primary : "#e0e0e0"
      }}
      aria-label={value ? `Square ${value}` : "Empty square"}
    >
      {value}
    </button>
  );
}

// --- Board Component ---
/** PUBLIC_INTERFACE
 * Renders the 3x3 tic-tac-toe board, passing state and click handlers for each square.
 */
function Board({ squares, onSquareClick, winningLine }) {
  // Build board: 3 rows x 3 cols
  const renderSquare = (i) => (
    <Square
      key={i}
      value={squares[i]}
      onClick={() => onSquareClick(i)}
      highlight={winningLine && winningLine.includes(i)}
    />
  );
  return (
    <div className="ttt-board">
      {[0,1,2].map(row =>
        <div className="ttt-row" key={row}>
          {[0,1,2].map(col =>
            renderSquare(row * 3 + col)
          )}
        </div>
      )}
    </div>
  );
}

// --- StatusBar Component ---
/** PUBLIC_INTERFACE
 * Shows turn indicator, winner/draw message, and statistics.
 */
function StatusBar({ status, stats, player }) {
  return (
    <div className="ttt-statusbar" style={{ color: COLORS.secondary }}>
      <div>
        <span style={{ fontWeight: 600, marginRight: 10 }}>Turn:</span>
        <span style={{ color: player === "X" ? COLORS.primary : COLORS.accent }}>
          {status.turnMsg}
        </span>
      </div>
      <div style={{ margin: '8px 0' }}>
        <span style={{ fontWeight: 600 }}>Score</span> — 
        <span style={{ color: COLORS.primary, marginLeft: 6 }}>X: {stats.X}</span>
        <span style={{ color: COLORS.accent, marginLeft: 10 }}>O: {stats.O}</span>
        <span style={{ color: COLORS.secondary, marginLeft: 10 }}>Draw: {stats.draw}</span>
      </div>
      {status.winMsg && (
        <div className="ttt-winner" style={{
          color:
            status.winMsg.includes("X") ? COLORS.primary :
            status.winMsg.includes("O") ? COLORS.accent :
            COLORS.secondary,
          fontWeight: 700, marginTop: 10, fontSize: "1.1em"
        }}>
          {status.winMsg}
        </div>
      )}
    </div>
  );
}

// --- Main App ---
/** PUBLIC_INTERFACE
 * The root Tic Tac Toe game component, handles top-level logic and layout.
 */
function App() {
  // --- State ---
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);         // true: X's turn, false: O's
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);           // "X", "O", "draw" or null
  const [stats, setStats] = useState({ X:0, O:0, draw:0 }); // Win/loss/draw counts
  
  // --- Calculate winner status and highlight line
  let winningLine = null;
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      winningLine = line;
      break;
    }
  }

  // --- Main status messaging ---
  const calculatedResult = calculateWinner(board);
  // Compose turn/status message
  let status = {
    turnMsg: '',
    winMsg: ''
  };
  if (calculatedResult === "X" || calculatedResult === "O") {
    status.winMsg = `Player ${calculatedResult} Wins!`;
  } else if (calculatedResult === "draw") {
    status.winMsg = "It's a Draw!";
  } else {
    status.turnMsg = `Player ${xIsNext ? "X" : "O"}'s turn`;
  }
  if (!status.turnMsg && !status.winMsg) {
    status.turnMsg = `Player ${xIsNext ? "X" : "O"}'s turn`;
  }

  // --- Square click handler ---
  function handleSquareClick(i) {
    if (board[i] || winner) return; // Ignore if already filled or game over
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);

    // Evaluate result after move
    const result = calculateWinner(newBoard);
    if (result) {
      setTimeout(() => {
        setWinner(result);
        setGameOver(true);
        setStats(prev => {
          let newStats = {...prev};
          if (result === 'draw') newStats.draw += 1;
          else newStats[result] += 1;
          return newStats;
        });
      }, 150); // Short delay to allow move to render
    } else {
      setXIsNext(!xIsNext);
    }
  }

  // --- New Game handler (reset board, alternate first player for fairness) ---
  function handleNewGame() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setGameOver(false);
    setXIsNext(prev => !prev);
  }

  // --- Restart Stats handler (reset board + stats) ---
  function handleResetStats() {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setGameOver(false);
    setStats({ X:0, O:0, draw:0 });
    setXIsNext(true);
  }

  // --- Effect: End game state update on win/draw ---
  React.useEffect(() => {
    if (calculatedResult) {
      setWinner(calculatedResult);
      setGameOver(true);
    }
  // eslint-disable-next-line
  }, [board]);

  // --- UI ---
  return (
    <div className="ttt-container" style={{
      minHeight: "100vh",
      background: "#f9fbfd",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Header */}
      <header className="ttt-header" style={{
        marginBottom: 18,
        color: COLORS.primary,
        textAlign: "center"
      }}>
        <h1 style={{
          fontSize: "2.25rem",
          margin: 0,
          fontWeight: "bold"
        }}>
          Tic Tac Toe
        </h1>
        <p style={{
          fontSize: "1.05rem",
          color: COLORS.secondary,
          fontWeight: 500,
          marginTop: 6
        }}>
          Play against a friend – Modern, clean, and fast!
        </p>
      </header>

      <main>
        {/* Status and Score */}
        <StatusBar status={status} stats={stats} player={xIsNext ? "X" : "O"} />

        {/* Game Board */}
        <Board
          squares={board}
          onSquareClick={i => {
            if (!gameOver) handleSquareClick(i);
          }}
          winningLine={winningLine}
        />

        {/* Action Buttons */}
        <div className="ttt-controls" style={{
          margin: "18px 0 0",
          display: "flex",
          justifyContent: "center",
          gap: 12
        }}>
          <button
            className="ttt-btn"
            style={{
              backgroundColor: COLORS.primary,
              color: "#fff"
            }}
            onClick={handleNewGame}
            disabled={!gameOver && board.every(v => !v)}
          >
            {gameOver ? "Start New Game" : "Restart"}
          </button>
          <button
            className="ttt-btn"
            style={{
              backgroundColor: COLORS.accent,
              color: "#fff"
            }}
            onClick={handleResetStats}
          >
            Reset Score
          </button>
        </div>
      </main>
      <footer style={{
        marginTop: 30, color: "#b0b0b0", fontSize: "0.97em"
      }}>
        <span style={{ color: COLORS.secondary, fontWeight: 400 }}>
          © {new Date().getFullYear()} 2-Player Tic Tac Toe · React · Modern UI
        </span>
      </footer>
    </div>
  );
}

export default App;
