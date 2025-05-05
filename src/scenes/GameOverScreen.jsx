import React from 'react';

const GameOverScreen = ({ score, onRestart }) => {
  return (
    <div className="game-over-screen">
      <h1>Game Over</h1>
      <p>Your Score: {score}</p>
      <button onClick={onRestart}>Restart Game</button>
    </div>
  );
};

export default GameOverScreen;
