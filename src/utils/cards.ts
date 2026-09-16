import type { CardData, Difficulty, DifficultyConfig } from '../types/game';
import { shuffle } from './shuffle';

const ICONS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
  '🐻', '🐼', '🐨', '🦁', '🐮', '🐷',
  '🐸', '🐵', '🦄', '🐝', '🦋', '🐢',
];

export const DIFFICULTY_MAP: Record<Difficulty, DifficultyConfig> = {
  '2x2': { cols: 2, rows: 2, pairs: 2, label: 'Tiny', emoji: '🌱' },
  '3x2': { cols: 3, rows: 2, pairs: 3, label: 'Easy', emoji: '🌟' },
  '4x3': { cols: 4, rows: 3, pairs: 6, label: 'Medium', emoji: '🎯' },
  '4x4': { cols: 4, rows: 4, pairs: 8, label: 'Hard', emoji: '⚡' },
  '5x4': { cols: 5, rows: 4, pairs: 10, label: 'Expert', emoji: '🔥' },
  '6x5': { cols: 6, rows: 5, pairs: 15, label: 'Master', emoji: '💎' },
  '6x6': { cols: 6, rows: 6, pairs: 18, label: 'Legend', emoji: '👑' },
};

export function getGridConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_MAP[difficulty];
}

export function generateCards(difficulty: Difficulty): CardData[] {
  const config = DIFFICULTY_MAP[difficulty];
  const icons = ICONS.slice(0, config.pairs);

  const cards: CardData[] = icons.flatMap((icon, index) => [
    {
      id: `card-${index * 2}`,
      pairId: `pair-${index}`,
      icon,
      isFlipped: false,
      isMatched: false,
      matchedBy: null,
    },
    {
      id: `card-${index * 2 + 1}`,
      pairId: `pair-${index}`,
      icon,
      isFlipped: false,
      isMatched: false,
      matchedBy: null,
    },
  ]);

  return shuffle(cards);
}
