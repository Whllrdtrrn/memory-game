import type { CardData, Difficulty } from '../../types/game';
import { getGridConfig } from '../../utils/cards';
import { Card } from '../Card/Card';
import styles from './Board.module.scss';

interface BoardProps {
  cards: CardData[];
  difficulty: Difficulty;
  disabled: boolean;
  isMultiplayer: boolean;
  currentPlayerIndex: number;
  onFlip: (id: string) => void;
}

export const PLAYER_COLORS = ['#7c6cf0', '#f06292', '#4dd0a8', '#ffc107'];

export function Board({ cards, difficulty, disabled, isMultiplayer, currentPlayerIndex, onFlip }: BoardProps) {
  const config = getGridConfig(difficulty);

  return (
    <div className={styles.boardWrapper}>
      <div
        className={styles.board}
        style={
          {
            '--grid-cols': config.cols,
            '--grid-rows': config.rows,
          } as React.CSSProperties
        }
        role="grid"
        aria-label="Memory game board"
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onFlip={onFlip}
            disabled={disabled}
            playerColor={
              isMultiplayer
                ? card.isMatched && card.matchedBy !== null
                  ? PLAYER_COLORS[card.matchedBy]
                  : card.isFlipped
                    ? PLAYER_COLORS[currentPlayerIndex]
                    : undefined
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
