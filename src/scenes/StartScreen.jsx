import React from "react";

const StartScreen = ({ onStart }) => {
  return (
    <div className="start-screen">
      <h1>Welcome to Subway Surfer Clone</h1>
      <button onClick={onStart}>Start</button>
    </div>
  );
};

export default StartScreen;
