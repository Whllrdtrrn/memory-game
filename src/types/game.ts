export interface CardData {
  id: string;
  pairId: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy: number | null; // player index who matched this card
}

export type Difficulty = '2x2' | '3x2' | '4x3' | '4x4' | '5x4' | '6x5' | '6x6';

export interface DifficultyConfig {
  cols: number;
  rows: number;
  pairs: number;
  label: string;
  emoji: string;
}

export interface Player {
  name: string;
  pairs: number;
}

export type GameMode = 'single' | 'series';
export type SeriesLength = 1 | 3 | 5;

export interface TournamentConfig {
  mode: GameMode;
  bestOf: SeriesLength;
}

export interface RoundResult {
  round: number;
  playerPairs: number[]; // pairs per player index
  winnerIndex: number | null; // null = tie
}

export interface GameState {
  cards: CardData[];
  flippedIds: string[];
  moves: number;
  difficulty: Difficulty;
  status: 'idle' | 'playing' | 'won';
  players: Player[];
  currentPlayerIndex: number;
}

export type GameAction =
  | { type: 'FLIP_CARD'; id: string }
  | { type: 'MATCH_SUCCESS' }
  | { type: 'MATCH_FAIL' }
  | { type: 'RESET'; difficulty?: Difficulty; players?: Player[] }
  | { type: 'RESTORE'; state: GameState };

export interface BestScore {
  moves: number;
  time: number;
  difficulty: Difficulty;
}
