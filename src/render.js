/**
 * Renderer draws game state onto a canvas.
 * - Uses pixel scaling to keep crisp blocks regardless of canvas size.
 */
export class Renderer {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   * @param {number} options.cols
   * @param {number} options.rows
   */
  constructor(canvas, { cols = 24, rows = 24 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cols = cols;
    this.rows = rows;
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Draw the grid-aligned game.
   * @param {Game} game
   */
  draw(game) {
    const { ctx, canvas, cols, rows } = this;
    const cellW = Math.floor(canvas.width / cols);
    const cellH = Math.floor(canvas.height / rows);

    // background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw food
    if (game.food) {
      ctx.fillStyle = '#ff4d4d';
      ctx.fillRect(game.food.x * cellW, game.food.y * cellH, cellW, cellH);
    }

    // draw snake
    // head
    if (game.snake.length > 0) {
      const head = game.snake[0];
      ctx.fillStyle = '#66ff66';
      ctx.fillRect(head.x * cellW, head.y * cellH, cellW, cellH);
    }
    // body
    ctx.fillStyle = '#2db82d';
    for (let i = 1; i < game.snake.length; i++) {
      const p = game.snake[i];
      ctx.fillRect(p.x * cellW, p.y * cellH, cellW, cellH);
    }

    // overlay grid (optional — subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 1; x < cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW + 0.5, 0);
      ctx.lineTo(x * cellW + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 1; y < rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH + 0.5);
      ctx.lineTo(canvas.width, y * cellH + 0.5);
      ctx.stroke();
    }
  }
}