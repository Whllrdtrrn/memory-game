import type { Difficulty, BestScore } from '../../types/game';
import { DIFFICULTY_MAP } from '../../utils/cards';
import { formatTime } from '../../hooks/useTimer';
import styles from './Controls.module.scss';

interface ControlsProps {
  time: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  difficulty: Difficulty;
  bestScore: BestScore | null;
  onReset: () => void;
  onChangeDifficulty: (d: Difficulty) => void;
}

const DIFFICULTIES = Object.keys(DIFFICULTY_MAP) as Difficulty[];

export function Controls({
  time,
  moves,
  matchedPairs,
  totalPairs,
  difficulty,
  bestScore,
  onReset,
  onChangeDifficulty,
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.icon}>⏱️</span>
          <div className={styles.statContent}>
            <span className={styles.value}>{formatTime(time)}</span>
            <span className={styles.label}>Time</span>
          </div>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>👆</span>
          <div className={styles.statContent}>
            <span className={styles.value}>{moves}</span>
            <span className={styles.label}>Moves</span>
          </div>
        </div>

        <div className={styles.stat}>
          <span className={styles.icon}>🃏</span>
          <div className={styles.statContent}>
            <span className={styles.value}>
              {matchedPairs}/{totalPairs}
            </span>
            <span className={styles.label}>Pairs</span>
          </div>
        </div>

        {bestScore && (
          <div className={`${styles.stat} ${styles.bestStat}`}>
            <span className={styles.icon}>🏆</span>
            <div className={styles.statContent}>
              <span className={styles.value}>{bestScore.moves}</span>
              <span className={styles.label}>Best</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.actionBar}>
        <div className={styles.difficulty} role="group" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => {
            const config = DIFFICULTY_MAP[d];
            return (
              <button
                key={d}
                className={`${styles.diffBtn} ${d === difficulty ? styles.active : ''}`}
                onClick={() => onChangeDifficulty(d)}
                title={`${config.label} (${d})`}
              >
                <span className={styles.diffEmoji}>{config.emoji}</span>
                <span className={styles.diffLabel}>{d}</span>
              </button>
            );
          })}
        </div>

        <button className={styles.resetBtn} onClick={onReset}>
          <span className={styles.resetIcon}>↻</span>
          Restart
        </button>
      </div>
    </div>
  );
}
