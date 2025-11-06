/**
 * Minimal deterministic game logic for Snake.
 * - Grid coordinates: x in [0..cols-1], y in [0..rows-1]
 * - Snake stored as array with head at index 0
 * - Methods are intentionally synchronous and side-effect minimal for testability
 */

export type Point = { x: number; y: number };

export class Game {
  cols: number;
  rows: number;
  snake: Point[];
  direction: Point;
  nextDirection: Point;
  food: Point | null;
  score: number;
  over: boolean;
  growAmount: number;

  constructor({ cols = 24, rows = 24 } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.reset();
  }

  reset() {
    const midX = Math.floor(this.cols / 2);
    const midY = Math.floor(this.rows / 2);
    this.snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { ...this.direction };
    this.score = 0;
    this.over = false;
    this.growAmount = 0;
    this.placeFood();
  }

  placeFood() {
    const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`));
    const free: Point[] = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) free.push({ x, y });
      }
    }
    if (free.length === 0) {
      this.food = null;
      return;
    }
    this.food = free[Math.floor(Math.random() * free.length)];
  }

  setDirection(dir: Point) {
    // reject reversal
    if (dir.x === -this.direction.x && dir.y === -this.direction.y) return;
    this.nextDirection = dir;
  }

  step(): { ate: boolean; died: boolean; reason?: 'wall' | 'self' } {
    if (this.over) return { ate: false, died: true };
    this.direction = { ...this.nextDirection };

    const head = this.snake[0];
    const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

    // wall collision
    if (newHead.x < 0 || newHead.x >= this.cols || newHead.y < 0 || newHead.y >= this.rows) {
      this.over = true;
      return { ate: false, died: true, reason: 'wall' };
    }

    // self collision
    if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.over = true;
      return { ate: false, died: true, reason: 'self' };
    }

    this.snake.unshift(newHead);
    let ate = false;
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      ate = true;
      this.score += 1;
      this.growAmount += 1;
      this.placeFood();
    }

    if (this.growAmount > 0) {
      this.growAmount -= 1;
    } else {
      this.snake.pop();
    }

    return { ate, died: false };
  }
}