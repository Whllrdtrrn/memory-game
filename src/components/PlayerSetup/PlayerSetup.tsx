import { useState } from 'react';
import type { Difficulty, Player, GameMode, SeriesLength, TournamentConfig } from '../../types/game';
import { DIFFICULTY_MAP } from '../../utils/cards';
import styles from './PlayerSetup.module.scss';

interface PlayerSetupProps {
  onStart: (players: Player[], difficulty: Difficulty, tournament: TournamentConfig) => void;
}

const DIFFICULTIES = Object.keys(DIFFICULTY_MAP) as Difficulty[];
const PLAYER_COLORS = ['#7c6cf0', '#f06292', '#4dd0a8', '#ffc107'];

export function PlayerSetup({ onStart }: PlayerSetupProps) {
  const [playerCount, setPlayerCount] = useState(1);
  const [names, setNames] = useState(['', '', '', '']);
  const [difficulty, setDifficulty] = useState<Difficulty>('4x4');
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [bestOf, setBestOf] = useState<SeriesLength>(3);

  const isMultiplayer = playerCount > 1;

  const handleNameChange = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleStart = () => {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      name: names[i]?.trim() || `Player ${i + 1}`,
      pairs: 0,
    }));
    onStart(players, difficulty, { mode: isMultiplayer ? gameMode : 'single', bestOf });
  };

  return (
    <div className={styles.setup}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Game Settings</h2>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Players</label>
          <div className={styles.playerToggle}>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`${styles.toggleBtn} ${playerCount === n ? styles.active : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n === 1 ? '👤 Solo' : `👥 ${n}P`}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Player Names</label>
          <div className={styles.nameInputs}>
            {Array.from({ length: playerCount }, (_, i) => (
              <div key={i} className={styles.nameRow}>
                <span
                  className={styles.playerDot}
                  style={{ background: PLAYER_COLORS[i] }}
                />
                <input
                  type="text"
                  className={styles.nameInput}
                  placeholder={`Player ${i + 1}`}
                  value={names[i] || ''}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  maxLength={15}
                />
              </div>
            ))}
          </div>
        </div>

        {isMultiplayer && (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Game Mode</label>
            <div className={styles.playerToggle}>
              <button
                className={`${styles.toggleBtn} ${gameMode === 'single' ? styles.active : ''}`}
                onClick={() => setGameMode('single')}
              >
                🎮 Single Round
              </button>
              <button
                className={`${styles.toggleBtn} ${gameMode === 'series' ? styles.active : ''}`}
                onClick={() => setGameMode('series')}
              >
                🏆 Tournament
              </button>
            </div>

            {gameMode === 'series' && (
              <div className={styles.seriesSelect}>
                <span className={styles.seriesLabel}>Best of</span>
                <div className={styles.seriesOptions}>
                  {([3, 5] as SeriesLength[]).map((n) => (
                    <button
                      key={n}
                      className={`${styles.seriesBtn} ${bestOf === n ? styles.seriesActive : ''}`}
                      onClick={() => setBestOf(n)}
                    >
                      <span className={styles.seriesNum}>{n}</span>
                      <span className={styles.seriesWins}>First to {Math.ceil(n / 2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Difficulty</label>
          <div className={styles.difficultyGrid}>
            {DIFFICULTIES.map((d) => {
              const config = DIFFICULTY_MAP[d];
              return (
                <button
                  key={d}
                  className={`${styles.diffBtn} ${d === difficulty ? styles.diffActive : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  <span className={styles.diffEmoji}>{config.emoji}</span>
                  <span className={styles.diffName}>{config.label}</span>
                  <span className={styles.diffSize}>{d}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button className={styles.startBtn} onClick={handleStart}>
          {isMultiplayer && gameMode === 'series' ? `Start Best of ${bestOf}` : 'Start Game'}
        </button>
      </div>
    </div>
  );
}
