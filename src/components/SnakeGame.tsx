import React, { useEffect, useRef, useState } from 'react';
import { Game, Point } from '../lib/game';

/**
 * SnakeGame React component
 * - Uses a fixed tick interval for game logic (TICK_MS)
 * - Renders via requestAnimationFrame to a canvas for smooth visuals
 * - Keyboard input maps to direction vectors; reversals are prevented by Game#setDirection
 */

const COLS = 24;
const ROWS = 24;
const TICK_MS = 120;

export default function SnakeGame(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const rafRef = useRef<number | null>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const lastTickRef = useRef<number>(performance.now());
  const accumulatedRef = useRef<number>(0);

  // initialize game
  useEffect(() => {
    gameRef.current = new Game({ cols: COLS, rows: ROWS });
    setScore(0);
    // ensure canvas size on mount
    fitCanvas();
    window.addEventListener('resize', fitCanvas);
    return () => {
      window.removeEventListener('resize', fitCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keyboard input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Point> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
        W: { x: 0, y: -1 }, S: { x: 0, y: 1 }, A: { x: -1, y: 0 }, D: { x: 1, y: 0 }
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      const g = gameRef.current;
      if (g) g.setDirection(dir);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // game loop: tick + render
  useEffect(() => {
    lastTickRef.current = performance.now();
    accumulatedRef.current = 0;

    function tickAndRender(ts: number) {
      const g = gameRef.current!;
      const dt = ts - lastTickRef.current;
      lastTickRef.current = ts;
      if (running && !g.over) {
        accumulatedRef.current += dt;
        while (accumulatedRef.current >= TICK_MS) {
          const res = g.step();
          if (res.ate) setScore(g.score);
          if (res.died) setRunning(false);
          accumulatedRef.current -= TICK_MS;
        }
      }
      renderGame();
      rafRef.current = requestAnimationFrame(tickAndRender);
    }

    rafRef.current = requestAnimationFrame(tickAndRender);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function fitCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = Math.min(window.innerHeight * 0.8, window.innerWidth * 0.6, 600);
    canvas.width = Math.floor(size);
    canvas.height = Math.floor(size);
    renderGame();
  }

  function renderGame() {
    const canvas = canvasRef.current;
    const g = gameRef.current;
    if (!canvas || !g) return;
    const ctx = canvas.getContext('2d')!;
    const cellW = Math.floor(canvas.width / COLS);
    const cellH = Math.floor(canvas.height / ROWS);

    // background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    if (g.food) {
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(g.food.x * cellW, g.food.y * cellH, cellW, cellH);
    }

    // snake head
    if (g.snake.length > 0) {
      const head = g.snake[0];
      ctx.fillStyle = '#66ff66';
      ctx.fillRect(head.x * cellW, head.y * cellH, cellW, cellH);
    }
    // snake body
    ctx.fillStyle = '#2db82d';
    for (let i = 1; i < g.snake.length; i++) {
      const p = g.snake[i];
      ctx.fillRect(p.x * cellW, p.y * cellH, cellW, cellH);
    }

    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW + 0.5, 0);
      ctx.lineTo(x * cellW + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH + 0.5);
      ctx.lineTo(canvas.width, y * cellH + 0.5);
      ctx.stroke();
    }

    // overlay message when game over
    if (g.over) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(16, Math.floor(canvas.width / 16))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText(`Score: ${g.score}`, canvas.width / 2, canvas.height / 2 + 24);
    }
  }

  function onPauseClick() {
    const g = gameRef.current!;
    if (g.over) {
      g.reset();
      setScore(0);
      setRunning(true);
      lastTickRef.current = performance.now();
      accumulatedRef.current = 0;
    } else {
      setRunning(v => !v);
    }
  }

  return (
    <>
      <canvas ref={canvasRef} id="game" aria-label="Snake game canvas" />
      <div style={{ width: 240, marginLeft: 16 }} aria-hidden>
        <div>Score: {score}</div>
        <div className="meta">Controls: Arrow keys / WASD</div>
        <button onClick={onPauseClick}>{gameRef.current?.over ? 'Restart' : running ? 'Pause' : 'Resume'}</button>
      </div>
    </>
  );
}