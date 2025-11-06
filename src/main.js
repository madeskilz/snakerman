/**
 * Bootstraps the game: wires input, game loop, renderer and UI.
 * Uses a fixed tick interval for deterministic game steps while rendering happens via requestAnimationFrame.
 */
import { Game } from './game.js';
import { Renderer } from './render.js';
import { Input } from './input.js';

const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const pauseBtn = document.getElementById('pauseBtn');

// configure grid and canvas scale
const COLS = 24, ROWS = 24;
function fitCanvas() {
  // make canvas square and responsive (max 80vh)
  const size = Math.min(window.innerHeight * 0.8, window.innerWidth * 0.6, 600);
  canvas.width = Math.floor(size);
  canvas.height = Math.floor(size);
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const game = new Game({ cols: COLS, rows: ROWS });
const renderer = new Renderer(canvas, { cols: COLS, rows: ROWS });
const input = new Input();

// timing
const TICK_MS = 120; // snake moves every 120ms
let accumulated = 0;
let lastTs = performance.now();
let running = true;

function stepTick() {
  // consume input and set direction if valid (Game prevents reversal)
  const dir = input.consume();
  game.setDirection(dir);
  const res = game.step();
  if (res.ate) {
    scoreEl.textContent = String(game.score);
  }
  if (res.died) {
    running = false;
    pauseBtn.textContent = 'Restart';
  }
}

function loop(ts) {
  const dt = ts - lastTs;
  lastTs = ts;
  if (running && !game.over) {
    accumulated += dt;
    // perform one or more logic ticks if needed (keeps deterministic speed when frame drops)
    while (accumulated >= TICK_MS) {
      stepTick();
      accumulated -= TICK_MS;
    }
  }
  // render every frame
  renderer.draw(game);
  requestAnimationFrame(loop);
}

// Pause / restart handling
pauseBtn.addEventListener('click', () => {
  if (!running && game.over) {
    game.reset();
    scoreEl.textContent = '0';
    running = true;
    pauseBtn.textContent = 'Pause';
    lastTs = performance.now();
    accumulated = 0;
    return;
  }
  running = !running;
  pauseBtn.textContent = running ? 'Pause' : 'Resume';
});

requestAnimationFrame(loop);