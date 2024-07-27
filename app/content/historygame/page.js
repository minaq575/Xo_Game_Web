"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/history.module.css';

export default function HistoryPage() {
  const [histories, setHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const [grid, setGrid] = useState([]);
  const [replayInterval, setReplayInterval] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningMove, setWinningMove] = useState(null);
  const router = useRouter(); 

  useEffect(() => {
    const savedHistory = localStorage.getItem('gameHistory');
    if (savedHistory) {
      setHistories(JSON.parse(savedHistory));
    }
  }, []);

  const startReplay = useCallback(() => {
  if (!selectedHistory) return;

  // Reset grid and index for replay
  setReplayIndex(0);
  setGrid(Array(selectedHistory.gridSize).fill("").map(() => Array(selectedHistory.gridSize).fill("")));
  setWinner(null);
  setWinningMove(null);

  if (replayInterval) {
    clearInterval(replayInterval);
  }

  const interval = setInterval(() => {
    if (replayIndex < selectedHistory.moves.length) {
      const move = selectedHistory.moves[replayIndex];
      const newGrid = grid.map(row => row.slice());
      newGrid[move.row][move.col] = move.player;
      setGrid(newGrid);
      setReplayIndex(prev => prev + 1);

      if (move.isWinningMove) {
        setWinningMove(move);
        setWinner(selectedHistory.winner);
        clearInterval(interval);
      }

    } else {
      clearInterval(interval);
      const lastMove = selectedHistory.moves[selectedHistory.moves.length - 1];
      if (lastMove) {
        const finalGrid = grid.map(row => row.slice());
        finalGrid[lastMove.row][lastMove.col] = lastMove.player;
        setGrid(finalGrid);
      }
    }
  }, 1000);

  setReplayInterval(interval);
}, [selectedHistory, replayIndex, grid, replayInterval]);


  const handleReplay = (history) => {
    setSelectedHistory(history);
    startReplay();
  };

  const handleReset = () => {
    localStorage.removeItem('gameHistory');
    setHistories([]);
    setSelectedHistory(null);
    setReplayIndex(0);
    setGrid([]);
    setReplayInterval(null);
    setWinner(null);
    setWinningMove(null);
  };

  const handleBackToGame = () => {
    router.push('/content/game'); 
  };

  const renderMoves = () => {
    return selectedHistory.moves.map((move, index) => (
      <li key={index} className={move.isWinningMove ? styles.winningMove : ''}>
        Move {index + 1}: {move.player} to ({move.row}, {move.col})
      </li>
    ));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Game History</h1>
      {selectedHistory ? (
        <div className={styles.historyDetails}>
          {winner && <h2 className={styles.winner}>Winner: {winner}</h2>}
          {winningMove && (
            <p className={styles.winningMoveDetails}>
              Winning Move: Player {winningMove.player} to ({winningMove.row}, {winningMove.col})
            </p>
          )}
          <ul className={styles.moveHistory}>
            {renderMoves()}
          </ul>
          <div className={styles.buttonGroup}>
            <button onClick={() => setSelectedHistory(null)} className={styles.button}>
              Back to History List
            </button>
            <button onClick={handleBackToGame} className={styles.button}>
              Back to Game
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.historyList}>
          <ul>
            {histories.map((history, index) => (
              <li key={index} className={styles.historyItem}>
                <p>Grid Size: {history.gridSize}</p>
                <p>Winner: {history.winner}</p>
                {history.moves.some(move => move.isWinningMove) && (
                  <p>
                    Winning Move: Player {history.moves.find(move => move.isWinningMove).player} 
                    to ({history.moves.find(move => move.isWinningMove).row}, 
                    {history.moves.find(move => move.isWinningMove).col})
                  </p>
                )}
                <button onClick={() => handleReplay(history)} className={styles.button}>
                  Replay
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.buttonGroup}>
            <button onClick={handleReset} className={styles.button}>
              Reset History
            </button>
            <button onClick={handleBackToGame} className={styles.button}>
              Back to Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
