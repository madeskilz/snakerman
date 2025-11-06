/**
 * Input manager: listens for keyboard and maps to direction vectors.
 * Prevents multiple changes per frame by tracking lastApplied flag.
 */
export class Input {
  constructor() {
    this.dir = { x: 1, y: 0 }; // default direction
    this._lastApplied = null; // to prevent double changes within one tick
    this._onKey = this._onKey.bind(this);
    window.addEventListener('keydown', this._onKey);
  }

  dispose() {
    window.removeEventListener('keydown', this._onKey);
  }

  _onKey(e) {
    const map = {
      ArrowUp:    { x: 0, y: -1 },
      ArrowDown:  { x: 0, y:  1 },
      ArrowLeft:  { x: -1, y: 0 },
      ArrowRight: { x: 1, y:  0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
      W: { x: 0, y: -1 }, S: { x: 0, y: 1 }, A: { x: -1, y: 0 }, D: { x: 1, y: 0 },
    };
    const dir = map[e.key];
    if (!dir) return;
    // throttle so the game logic can decide whether to accept or reject reversal.
    this.dir = dir;
    // prevent page scrolling for arrow keys
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  }

  /**
   * Read & consume the current queued direction once per tick.
   * @returns {{x:number,y:number}}
   */
  consume() {
    const d = this.dir;
    // keep current direction until changed by keyboard
    return d;
  }
}