import React from 'react';

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1>Welcome to Subway Surfer Clone</h1>
      <p>Press Enter or click the button to start</p>
      <button onClick={onStart}>Start Game</button>
      <p>Or press <strong>Enter</strong> to start the game.</p>
    </div>
  );
};

export default StartScreen;
