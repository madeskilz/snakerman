import React from 'react';
import SnakeGame from './components/SnakeGame';

export default function App(): JSX.Element {
  return (
    <div className="app">
      <SnakeGame />
      <div className="sidebar" aria-hidden>
        <h2>Snakerman</h2>
        <div>Rules: eat food, grow, avoid walls and self.</div>
        <div className="meta">Controls: Arrow keys / WASD</div>
        <div className="meta">Press Pause to pause, Restart after game over.</div>
      </div>
    </div>
  );
}