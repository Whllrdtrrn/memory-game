import type { CardData } from '../../types/game';
import styles from './Card.module.scss';

interface CardProps {
  card: CardData;
  onFlip: (id: string) => void;
  disabled: boolean;
  playerColor?: string;
}

export function Card({ card, onFlip, disabled, playerColor }: CardProps) {
  const { id, icon, isFlipped, isMatched } = card;
  const showFace = isFlipped || isMatched;

  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onFlip(id);
    }
  };

  const className = [
    styles.card,
    showFace ? styles.flipped : '',
    isMatched ? styles.matched : '',
    playerColor ? styles.hasPlayerColor : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      style={playerColor ? { '--player-color': playerColor } as React.CSSProperties : undefined}
    >
      <button
        className={styles.clickArea}
        onClick={handleClick}
        disabled={disabled && !showFace}
        aria-label={showFace ? `Card showing ${icon}` : 'Face-down card'}
        aria-pressed={showFace}
      />
      <div className={styles.inner}>
        <div className={styles.front}>{icon}</div>
        <div className={styles.back}>?</div>
      </div>
    </div>
  );
}
