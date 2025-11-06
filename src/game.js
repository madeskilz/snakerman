/**
 * Game state and logic for Snake.
 * - Grid coordinates are integers [0..cols-1], [0..rows-1]
 * - The snake is an array of {x,y} with head at index 0
 * - Movement is performed on a fixed tick interval via step()
 * - World uses wrap-around (toroidal) edges: snake passes through walls
 * - Optional obstacles may be placed in this.obstacles (game over on collision)
 */
export class Game {
  /**
   * Create a new Game instance.
   * @param {object} opts - options
   * @param {number} opts.cols - grid columns
   * @param {number} opts.rows - grid rows
   * @param {number} [opts.obstacleCount] - number of random obstacles to place at reset
   */
  constructor({ cols = 24, rows = 24, obstacleCount = Math.floor((cols * rows) / 50) } = {}) {
    this.cols = cols;
    this.rows = rows;
    // allow customizing obstacle count (default ~ 2% of board)
    this.obstacleCount = Math.max(0, Math.floor(obstacleCount));
    this.reset();
  }

  reset() {
    // initial snake in the middle moving right
    const midX = Math.floor(this.cols / 2);
    const midY = Math.floor(this.rows / 2);
    this.snake = [
      { x: midX, y: midY },
      { x: midX - 1, y: midY },
      { x: midX - 2, y: midY },
    ];
    this.direction = { x: 1, y: 0 }; // moving right
    this.nextDirection = { ...this.direction }; // queued direction to be applied next tick
    this.score = 0;
    this.over = false;
    this.growAmount = 0; // when >0, skip tail removal

    // generate obstacles (will avoid snake positions)
    this.generateObstacles(this.obstacleCount);

    // place food after obstacles so it never overlaps them
    this.placeFood();
  }

  /**
   * Generate `count` random obstacle positions avoiding the snake.
   * Stores result in this.obstacles as array of {x,y}.
   * @param {number} count
   */
  generateObstacles(count) {
    this.obstacles = [];
    if (!count || count <= 0) return;

    const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`));
    const free = [];
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
    // find all free cells and pick one at random
    const occupied = new Set(this.snake.map(p => `${p.x},${p.y}`));
    // include obstacles as occupied so food is not placed on them
    for (const o of this.obstacles || []) occupied.add(`${o.x},${o.y}`);

    const free = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const key = `${x},${y}`;
        if (!occupied.has(key)) free.push({ x, y });
      }
    }
    if (free.length === 0) {
      // player wins (filled board)
      this.food = null;
      return;
    }
    this.food = free[Math.floor(Math.random() * free.length)];
  }

  /**
   * Queue direction change, rejects reversals.
   * @param {{x:number,y:number}} dir
   */
  setDirection(dir) {
    // prevent reversing into self
    if (dir.x === -this.direction.x && dir.y === -this.direction.y) return;
    this.nextDirection = dir;
  }

  /**
   * Single game tick: move snake, handle collisions and food.
   * World wraps at edges: snake reappears on opposite side.
   * Returns an object describing events (e.g., ateFood, died)
   */
  step() {
    if (this.over) return { died: true };
    // apply queued direction
    this.direction = { ...this.nextDirection };

    const head = this.snake[0];
    let newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

    // wrap-around edges (toroidal world)
    newHead.x = ((newHead.x % this.cols) + this.cols) % this.cols;
    newHead.y = ((newHead.y % this.rows) + this.rows) % this.rows;

    // obstacle collision
    if (this.obstacles.some(o => o.x === newHead.x && o.y === newHead.y)) {
      this.over = true;
      return { died: true, reason: 'obstacle' };
    }

    // self collision
    if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.over = true;
      return { died: true, reason: 'self' };
    }

    // move
    this.snake.unshift(newHead);
    let ate = false;
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      ate = true;
      this.score += 1;
      this.growAmount += 1; // grow by 1 (can be adjusted)
      this.placeFood();
    }

    // handle growth: remove tail unless we need to grow
    if (this.growAmount > 0) {
      this.growAmount -= 1; // consume growth token, do not pop tail
    } else {
      this.snake.pop();
    }

    return { ate, died: false };
  }
}