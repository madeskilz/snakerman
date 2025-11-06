/**
 * Minimal deterministic game logic for Snake.
 * - Grid coordinates: x in [0..cols-1], y in [0..rows-1]
 * - Snake stored as array with head at index 0
 * - Methods are intentionally synchronous and side-effect minimal for testability
 * - World uses wrap-around (toroidal) edges: snake passes through walls
 * - Optional obstacles may be placed (game over on collision)
 */

export type Point = { x: number; y: number };

export class Game {
  cols: number;
  rows: number;
  obstacleCount: number;
  snake: Point[];
  direction: Point;
  nextDirection: Point;
  food: Point | null;
  score: number;
  over: boolean;
  growAmount: number;
  obstacles: Point[];

  constructor({ cols = 24, rows = 24, obstacleCount = Math.floor((cols * rows) / 50) } = {}) {
    this.cols = cols;
    this.rows = rows;
    this.obstacleCount = Math.max(0, Math.floor(obstacleCount));
    // Initialize all properties to satisfy TypeScript strict mode
    this.snake = [];
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.food = null;
    this.score = 0;
    this.over = false;
    this.growAmount = 0;
    this.obstacles = [];
    // Now call reset to properly initialize
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
    
    // Generate obstacles before placing food
    this.generateObstacles(this.obstacleCount);
    this.placeFood();
  }

  /**
   * Generate `count` random obstacle positions avoiding the snake.
   * Stores result in this.obstacles as array of {x,y}.
   */
  generateObstacles(count: number) {
    this.obstacles = [];
    if (!count || count <= 0) return;

    const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`));
    const free: Point[] = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) free.push({ x, y });
      }
    }
    // shuffle-free selection
    for (let i = 0; i < count && free.length > 0; i++) {
      const idx = Math.floor(Math.random() * free.length);
      const [pos] = free.splice(idx, 1);
      this.obstacles.push(pos);
    }
  }

  placeFood() {
    const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`));
    // Include obstacles as occupied so food is not placed on them
    for (const o of this.obstacles) occupied.add(`${o.x},${o.y}`);
    
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

  step(): { ate: boolean; died: boolean; reason?: 'wall' | 'self' | 'obstacle' } {
    if (this.over) return { ate: false, died: true };
    this.direction = { ...this.nextDirection };

    const head = this.snake[0];
    let newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

    // Wrap-around edges (toroidal world)
    newHead.x = ((newHead.x % this.cols) + this.cols) % this.cols;
    newHead.y = ((newHead.y % this.rows) + this.rows) % this.rows;

    // Obstacle collision
    if (this.obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
      this.over = true;
      return { ate: false, died: true, reason: 'obstacle' };
    }

    // Self collision
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