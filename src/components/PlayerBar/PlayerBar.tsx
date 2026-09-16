import type { Player } from '../../types/game';
import styles from './PlayerBar.module.scss';

interface PlayerBarProps {
  players: Player[];
  currentPlayerIndex: number;
  isMultiplayer: boolean;
  roundWins?: number[];
  currentRound?: number;
  totalRounds?: number;
  isSeries?: boolean;
}

const PLAYER_COLORS = ['#7c6cf0', '#f06292', '#4dd0a8', '#ffc107'];

export function PlayerBar({
  players,
  currentPlayerIndex,
  isMultiplayer,
  roundWins,
  currentRound,
  totalRounds,
  isSeries,
}: PlayerBarProps) {
  if (!isMultiplayer) return null;

  return (
    <div className={styles.wrapper}>
      {isSeries && (
        <div className={styles.roundBadge}>
          Round {currentRound} of {totalRounds}
        </div>
      )}
      <div className={styles.bar}>
        {players.map((player, i) => (
          <div
            key={i}
            className={`${styles.player} ${i === currentPlayerIndex ? styles.active : ''}`}
            style={{ '--player-color': PLAYER_COLORS[i] } as React.CSSProperties}
          >
            <span className={styles.indicator} />
            <div className={styles.info}>
              <span className={styles.name}>{player.name}</span>
              {isSeries && roundWins && (
                <span className={styles.wins}>
                  {roundWins[i]} win{roundWins[i] !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span className={styles.score}>{player.pairs}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
