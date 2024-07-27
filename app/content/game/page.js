"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/styles/game.module.css";

export default function GamePage() {
  const [gridSize, setGridSize] = useState("3");
  const [error, setError] = useState("");
  const [grid, setGrid] = useState(Array(3).fill("").map(() => Array(3).fill("")));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("Player");
  const [gameHistory, setGameHistory] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [xColor, setXColor] = useState("#f44336");
  const [oColor, setOColor] = useState("#4CAF50");
  const router = useRouter();

  useEffect(() => {
    const size = parseInt(gridSize, 10);
    if (!isNaN(size) && size >= 3) {
      setGrid(Array(size).fill("").map(() => Array(size).fill("")));
      setWinner("");
    }
  }, [gridSize]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('gameHistory');
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleGridSizeChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setGridSize(value);
    }
  };

  const handleClick = (row, col) => {
    if (grid[row][col] || winner) return;

    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? (isXNext ? "X" : "O") : cell))
    );
    setGrid(newGrid);
    setIsXNext(!isXNext);
    setCurrentPlayer(isXNext ? "AI" : "Player");

    const move = { player: isXNext ? "X" : "O", row, col };
    const newMoveHistory = [...moveHistory, move];
    setMoveHistory(newMoveHistory);

    checkWinner(newGrid, newMoveHistory);
  };

  const checkLine = (cells) => cells.every(cell => cell === cells[0] && cell !== "");

  const checkWinner = (grid, newMoveHistory) => {
    const size = grid.length;
    const winLength = size >= 4 ? 4 : 3;

    const checkSegments = (segments) => {
      for (const segment of segments) {
        if (checkLine(segment)) {
          const winner = segment[0] === "X" ? "winX" : "winO";
          setWinner(winner);
          saveGameHistory(size, grid, newMoveHistory, winner);
          return true;
        }
      }
      return false;
    };

    const rowSegments = [];
    const colSegments = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        rowSegments.push(grid[i].slice(j, j + winLength));
        colSegments.push(grid.slice(j, j + winLength).map(row => row[i]));
      }
    }

    const diagonalSegments = [];
    const antiDiagonalSegments = [];
    for (let i = 0; i <= size - winLength; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        diagonalSegments.push(Array.from({ length: winLength }, (_, k) => grid[i + k][j + k]));
        antiDiagonalSegments.push(Array.from({ length: winLength }, (_, k) => grid[i + k][j + winLength - 1 - k]));
      }
    }

    if (
      checkSegments(rowSegments) ||
      checkSegments(colSegments) ||
      checkSegments(diagonalSegments) ||
      checkSegments(antiDiagonalSegments)
    ) return;

    if (grid.flat().every(cell => cell)) {
      setWinner("Tie");
      saveGameHistory(size, grid, newMoveHistory, "Tie");
    }
  };

  const saveGameHistory = (gridSize, grid, moveHistory, winner) => {
    const newHistory = { gridSize, moves: moveHistory, winner };
    const updatedHistory = [...gameHistory, newHistory];
    localStorage.setItem('gameHistory', JSON.stringify(updatedHistory));
    setGameHistory(updatedHistory);
  };

  const renderGrid = () => (
    grid.map((row, rowIndex) => (
      <div key={rowIndex} className={styles.row}>
        {row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`${styles.cell} ${cell ? styles.filled : ""} ${cell === "X" ? styles.x : ""} ${cell === "O" ? styles.o : ""}`}
            onClick={() => handleClick(rowIndex, colIndex)}
            style={{ color: cell === "X" ? xColor : cell === "O" ? oColor : "" }}
          >
            {cell}
          </div>
        ))}
      </div>
    ))
  );

  const resetGame = () => {
    const size = parseInt(gridSize, 10);
    if (!isNaN(size) && size >= 3) {
      setGrid(Array(size).fill("").map(() => Array(size).fill("")));
      setIsXNext(true);
      setCurrentPlayer("Player");
      setWinner("");
      setError("");
      setMoveHistory([]);
    }
  };

  const makeAIMove = () => {
    const size = parseInt(gridSize, 10);
    if (isNaN(size) || size < 3) return;

    const emptyCells = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!grid[i][j]) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length === 0) return;

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    handleClick(row, col);
  };

  useEffect(() => {
    if (!isXNext && !winner) {
      const timer = setTimeout(makeAIMove, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner]);

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          type="number"
          value={gridSize}
          onChange={handleGridSizeChange}
          placeholder="Enter Grid size (min 3)"
          className={styles.input}
        /> 
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <p className={styles.currentPlayer}>
        Current Turn: {currentPlayer}
      </p>
      <div className={styles.grid}>{renderGrid()}</div>
      {winner && <p className={styles.winner}>Winner: {winner}</p>}
      <div className={styles.buttons}>
        <button className={styles.button} onClick={resetGame}>
          Reset!
        </button>
        <button className={styles.button} onClick={() => router.push('/content/historygame')}>
          History
        </button>
        <button className={styles.button} onClick={() => router.push('/content/homepage')}>
          Back
        </button>
      </div>
    </div>
  );
}
