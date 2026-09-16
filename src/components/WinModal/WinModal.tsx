import type { Player } from '../../types/game';
import { formatTime } from '../../hooks/useTimer';
import styles from './WinModal.module.scss';

interface WinModalProps {
  moves: number;
  time: number;
  totalPairs: number;
  isNewBest: boolean;
  players: Player[];
  isMultiplayer: boolean;
  isSeries: boolean;
  currentRound: number;
  totalRounds: number;
  roundWins: number[];
  seriesOver: boolean;
  onNextRound: () => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

const PLAYER_COLORS = ['#7c6cf0', '#f06292', '#4dd0a8', '#ffc107'];

export function WinModal({
  moves,
  time,
  totalPairs,
  isNewBest,
  players,
  isMultiplayer,
  isSeries,
  currentRound,
  totalRounds,
  roundWins,
  seriesOver,
  onNextRound,
  onPlayAgain,
  onNewGame,
}: WinModalProps) {
  const stars = moves <= totalPairs ? 3 : moves <= totalPairs * 1.5 ? 2 : 1;

  const maxPairs = Math.max(...players.map((p) => p.pairs));
  const winners = players.filter((p) => p.pairs === maxPairs);
  const isTie = isMultiplayer && winners.length > 1;

  const maxWins = Math.max(...roundWins);
  const seriesWinnerIndex = roundWins.indexOf(maxWins);
  const seriesWinnerName = players[seriesWinnerIndex]?.name;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Game complete">
      <div className={styles.modal}>
        {(isNewBest || (isSeries && seriesOver)) && (
          <div className={styles.confetti} aria-hidden="true" />
        )}

        {/* Solo stars */}
        {!isMultiplayer && (
          <div className={styles.stars} aria-label={`${stars} out of 3 stars`}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`${styles.star} ${i <= stars ? styles.starActive : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                ★
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        {isSeries && !seriesOver && (
          <div className={styles.roundTag}>Round {currentRound} of {totalRounds}</div>
        )}

        <h2 className={styles.title}>
          {isSeries && seriesOver
            ? `🏆 ${seriesWinnerName} is the Champion!`
            : isMultiplayer
              ? isTie
                ? "It's a Tie!"
                : `${winners[0].name} Wins${isSeries ? ' This Round!' : '!'}`
              : isNewBest
                ? '🏆 New Record!'
                : 'Well Done!'}
        </h2>

        {/* Player results for multiplayer */}
        {isMultiplayer ? (
          <div className={styles.playerResults}>
            {players
              .map((player, originalIndex) => ({ player, originalIndex }))
              .sort((a, b) => b.player.pairs - a.player.pairs)
              .map(({ player, originalIndex }, sortedIndex) => {
                const isWinner = player.pairs === maxPairs;
                return (
                  <div
                    key={originalIndex}
                    className={`${styles.playerResult} ${isWinner ? styles.winner : ''}`}
                  >
                    <span className={styles.rank}>
                      {isWinner ? '👑' : `#${sortedIndex + 1}`}
                    </span>
                    <span
                      className={styles.playerDot}
                      style={{ background: PLAYER_COLORS[originalIndex] }}
                    />
                    <span className={styles.playerName}>{player.name}</span>
                    <span className={styles.playerPairs}>{player.pairs} pairs</span>
                    {isSeries && (
                      <span className={styles.playerWins}>
                        {roundWins[originalIndex]}W
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className={styles.results}>
            <div className={styles.resultItem}>
              <span className={styles.resultIcon}>👆</span>
              <span className={styles.resultValue}>{moves}</span>
              <span className={styles.resultLabel}>Moves</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.resultItem}>
              <span className={styles.resultIcon}>⏱️</span>
              <span className={styles.resultValue}>{formatTime(time)}</span>
              <span className={styles.resultLabel}>Time</span>
            </div>
          </div>
        )}

        {/* Series progress dots */}
        {isSeries && !seriesOver && (
          <div className={styles.seriesProgress}>
            {Array.from({ length: totalRounds }, (_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i < currentRound ? styles.dotDone : ''} ${i === currentRound ? styles.dotNext : ''}`}
              />
            ))}
          </div>
        )}

        {isNewBest && !isMultiplayer && <p className={styles.badge}>Personal Best</p>}

        {/* Buttons */}
        <div className={styles.buttons}>
          {isSeries && !seriesOver ? (
            <button className={styles.playAgain} onClick={onNextRound} autoFocus>
              Next Round →
            </button>
          ) : (
            <button className={styles.playAgain} onClick={onPlayAgain} autoFocus>
              Play Again
            </button>
          )}
          <button className={styles.newGame} onClick={onNewGame}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
