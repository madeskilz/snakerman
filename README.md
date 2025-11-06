# Snakerman (Vite + React)

Run locally:

1. Install dependencies
   - yarn

2. Start dev server
   - yarn dev

3. Open in host browser (dev container):
   - $BROWSER http://localhost:5173

Notes:
- The app uses a fixed logic tick (TICK_MS) and fast rendering via requestAnimationFrame.
- You can tweak grid size in src/components/SnakeGame.tsx (COLS / ROWS) and TICK_MS.