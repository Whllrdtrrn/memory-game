import type { BestScore, Difficulty, GameState, Player, TournamentConfig } from '../types/game';

const BEST_SCORE_PREFIX = 'memory-game-best-';
const SESSION_KEY = 'memory-game-session';

// Best score helpers
function getKey(difficulty: Difficulty): string {
  return `${BEST_SCORE_PREFIX}${difficulty}`;
}

export function getBestScore(difficulty: Difficulty): BestScore | null {
  try {
    const raw = localStorage.getItem(getKey(difficulty));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBestScore(score: BestScore): boolean {
  const current = getBestScore(score.difficulty);
  const isNew =
    !current ||
    score.moves < current.moves ||
    (score.moves === current.moves && score.time < current.time);

  if (isNew) {
    localStorage.setItem(getKey(score.difficulty), JSON.stringify(score));
  }
  return isNew;
}

// Session persistence
export interface SessionData {
  gameState: GameState;
  tournament: TournamentConfig;
  currentRound: number;
  roundWins: number[];
  savedPlayers: Player[];
  time: number;
}

export function saveSession(data: SessionData): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
