# Memory Game — Implementation Plan

## Task Summary

Build a **Memory / Concentration** card-matching game using **React 18 + TypeScript + SCSS Modules + Vite**.

- **Company:** Sprintify IT Services Corp.
- **Position:** Front-End Developer
- **Deadline:** Before interview (Sept 18, 2026)
- **Submit to:** sisc.official.info@gmail.com
- **Deploy:** Vercel or Netlify

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool / dev server |
| SCSS Modules | Component-scoped styling |

> No heavy state libraries. Uses `useReducer` only.

---

## Project Structure

```
src/
├── components/
│   ├── Card/          # Individual card with flip animation
│   ├── Board/         # CSS Grid game board
│   ├── Controls/      # Timer, moves, difficulty, restart
│   └── WinModal/      # Victory overlay
├── hooks/
│   ├── useGameState.ts  # Core game logic (useReducer)
│   └── useTimer.ts      # Timer logic
├── types/
│   └── game.ts          # Shared TypeScript types
├── utils/
│   ├── shuffle.ts       # Fisher-Yates shuffle
│   ├── cards.ts         # Card data generation
│   └── storage.ts       # localStorage best scores
├── styles/
│   ├── _variables.scss  # Colors, sizes, breakpoints
│   ├── _mixins.scss     # Responsive, flex, button-reset
│   └── global.scss      # Reset, body, fonts
├── App.tsx              # Main game orchestrator
└── main.tsx             # Entry point
```

---

## Features Implemented

### Core (MVP)
- [x] 4x4 grid of face-down cards
- [x] Flip two cards per turn, match check with delay
- [x] Matched cards stay face-up, unmatched flip back
- [x] Shuffle on start and reset
- [x] Timer (starts on first flip, stops on win)
- [x] Move counter (per pair of flips)
- [x] Restart button
- [x] 3 difficulty levels: 2x2, 4x4, 6x6
- [x] Responsive down to 320px
- [x] SCSS Modules with variables/mixins
- [x] CSS flip animation (rotateY + backface-visibility)

### Stretch Goals
- [x] Best score in localStorage (by moves, tiebreak by time)
- [x] Keyboard accessible (buttons, focus-visible, aria labels)
- [x] Screen reader support (aria-live region)
- [x] Win modal with "New Best" indicator

---

## Deployment

```bash
npm run build
npx vercel --prod
```
