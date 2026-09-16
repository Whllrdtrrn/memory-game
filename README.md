# Memory Match

A card-matching memory game built with **React 18 + TypeScript + SCSS Modules + Vite**.

## Features

### Core
- 4x4 grid of face-down cards (default)
- Flip two cards per turn — match stays, mismatch flips back
- Timer (starts on first flip, stops on win)
- Move counter
- Restart button
- 7 difficulty levels (2x2 to 6x6)
- Responsive design (320px+ mobile)
- CSS flip animation (`rotateY` + `backface-visibility`)
- SCSS Modules with variables/mixins

### Extras
- Multiplayer (2-4 players) with turn-based gameplay
- Player name input with color-coded matched cards
- Tournament mode (Best of 3 / Best of 5)
- Best score tracking (localStorage)
- Game session persistence (survives page refresh)
- Keyboard accessible (Tab/Enter/Space)
- Screen reader support (ARIA labels, live regions)
- Star rating on win

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| SCSS Modules | Component-scoped styling |

No external state libraries — uses `useReducer` only.

## Run Locally

```bash
git clone https://github.com/jonathandeocampo/memory-game.git
cd memory-game
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Live Demo

[https://memory-game-jonathandeocampo.vercel.app](https://memory-game-jonathandeocampo.vercel.app)
