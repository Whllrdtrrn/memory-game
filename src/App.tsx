import { useEffect, useRef, useState, useCallback } from 'react';
import type { Difficulty, Player, TournamentConfig } from './types/game';
import { useGameState } from './hooks/useGameState';
import { useTimer } from './hooks/useTimer';
import { getBestScore, saveBestScore, saveSession, loadSession, clearSession } from './utils/storage';
import { playFlip, playMatch, playMismatch, playWin, playStart, playClick, startBGM, stopBGM, startMenuMusic, stopMenuMusic } from './utils/sounds';
import { getGridConfig } from './utils/cards';
import { Board } from './components/Board/Board';
import { Controls } from './components/Controls/Controls';
import { PlayerBar } from './components/PlayerBar/PlayerBar';
import { PlayerSetup } from './components/PlayerSetup/PlayerSetup';
import { WinModal } from './components/WinModal/WinModal';
import { Confetti } from './components/Confetti/Confetti';
import styles from './App.module.scss';

type Screen = 'setup' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const { state, flipCard, resolveMatch, reset, restore } = useGameState('4x4');
  const { cards, flippedIds, moves, difficulty, status, players, currentPlayerIndex } = state;

  const isPlaying = status === 'playing';
  const isMultiplayer = players.length > 1;
  const { time, reset: resetTimer, setTo: setTimeTo } = useTimer(isPlaying);
  const matchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [bestScore, setBestScore] = useState(getBestScore('4x4'));

  // Tournament state
  const [tournament, setTournament] = useState<TournamentConfig>({ mode: 'single', bestOf: 3 });
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWins, setRoundWins] = useState<number[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([]);

  const [musicOn, setMusicOn] = useState(true);

  const isSeries = isMultiplayer && tournament.mode === 'series';
  const winsNeeded = Math.ceil(tournament.bestOf / 2);
  const seriesOver = isSeries && roundWins.some((w) => w >= winsNeeded);

  const config = getGridConfig(difficulty);
  const matchedPairs = cards.filter((c) => c.isMatched).length / 2;

  // Track if we've restored to avoid overwriting on first render
  const hasRestoredRef = useRef(false);

  // Restore session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.gameState.status !== 'won') {
      restore(saved.gameState);
      setTournament(saved.tournament);
      setCurrentRound(saved.currentRound);
      setRoundWins(saved.roundWins);
      setSavedPlayers(saved.savedPlayers);
      setTimeTo(saved.time);
      setBestScore(getBestScore(saved.gameState.difficulty));
      setScreen('game');
      hasRestoredRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save session on every meaningful state change
  useEffect(() => {
    if (screen !== 'game') return;
    // Don't save during the initial render before restore completes
    if (!hasRestoredRef.current && status === 'idle' && moves === 0) {
      // Allow saving after first interaction or after restore
      return;
    }
    hasRestoredRef.current = true;

    saveSession({
      gameState: state,
      tournament,
      currentRound,
      roundWins,
      savedPlayers,
      time,
    });
  }, [state, tournament, currentRound, roundWins, savedPlayers, time, screen, status, moves]);

  // Auto-start music on first user interaction (browser requires it)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (musicOn) {
        if (screen === 'setup') startMenuMusic();
        else if (screen === 'game' && isPlaying) startBGM();
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Music control - menu music on setup, game BGM when playing
  useEffect(() => {
    if (!musicOn) {
      stopMenuMusic();
      stopBGM();
      return;
    }

    if (screen === 'setup') {
      stopBGM();
      startMenuMusic();
    } else if (screen === 'game' && isPlaying) {
      stopMenuMusic();
      startBGM();
    } else {
      stopMenuMusic();
      stopBGM();
    }
  }, [screen, isPlaying, musicOn]);

  // Match check
  useEffect(() => {
    if (flippedIds.length !== 2) return;

    const [first, second] = flippedIds;
    const card1 = cards.find((c) => c.id === first);
    const card2 = cards.find((c) => c.id === second);
    const isMatch = card1!.pairId === card2!.pairId;

    if (isMatch) {
      playMatch();
      resolveMatch(true);
    } else {
      matchTimeoutRef.current = setTimeout(() => {
        playMismatch();
        resolveMatch(false);
      }, 800);
    }

    return () => {
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    };
  }, [flippedIds, cards, resolveMatch]);

  // Handle win — record round result
  useEffect(() => {
    if (status !== 'won') return;
    playWin();

    if (!isMultiplayer) {
      const newBest = saveBestScore({ moves, time, difficulty });
      setIsNewBest(newBest);
      setBestScore(getBestScore(difficulty));
      return;
    }

    if (isSeries) {
      const maxPairs = Math.max(...players.map((p) => p.pairs));
      const winnerCandidates = players
        .map((p, i) => ({ pairs: p.pairs, index: i }))
        .filter((p) => p.pairs === maxPairs);

      setRoundWins((prev) => {
        const next = [...prev];
        if (winnerCandidates.length === 1) {
          next[winnerCandidates[0].index]++;
        }
        return next;
      });
    }
  }, [status, moves, time, difficulty, isMultiplayer, isSeries, players]);

  const handleStart = useCallback(
    (newPlayers: Player[], newDifficulty: Difficulty, tournamentConfig: TournamentConfig) => {
      setSavedPlayers(newPlayers);
      setTournament(tournamentConfig);
      setCurrentRound(1);
      setRoundWins(newPlayers.map(() => 0));
      reset(newDifficulty, newPlayers);
      resetTimer();
      setIsNewBest(false);
      setBestScore(getBestScore(newDifficulty));
      setScreen('game');
      hasRestoredRef.current = true;
      playStart();
    },
    [reset, resetTimer]
  );

  const handleNextRound = useCallback(() => {
    setCurrentRound((r) => r + 1);
    reset(undefined, savedPlayers);
    resetTimer();
  }, [reset, resetTimer, savedPlayers]);

  const handleReset = useCallback(() => {
    if (isSeries) {
      setCurrentRound(1);
      setRoundWins(savedPlayers.map(() => 0));
    }
    reset(undefined, savedPlayers);
    resetTimer();
    setIsNewBest(false);
    playClick();
  }, [reset, resetTimer, savedPlayers, isSeries]);

  const handleChangeDifficulty = useCallback(
    (d: Difficulty) => {
      if (isSeries) {
        setCurrentRound(1);
        setRoundWins(savedPlayers.map(() => 0));
      }
      reset(d, savedPlayers);
      resetTimer();
      setIsNewBest(false);
      setBestScore(getBestScore(d));
    },
    [reset, resetTimer, savedPlayers, isSeries]
  );

  const handleNewGame = useCallback(() => {
    clearSession();
    setScreen('setup');
    reset();
    resetTimer();
    setIsNewBest(false);
    setCurrentRound(1);
    setRoundWins([]);
  }, [reset, resetTimer]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <p className={styles.brand}>Whilo</p>
          <h1 className={styles.title}>Memory Match</h1>
          <p className={styles.subtitle}>Find all the matching pairs</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.musicBtn}
            onClick={() => setMusicOn((m) => !m)}
            title={musicOn ? 'Mute music' : 'Play music'}
          >
            {musicOn ? '🔊' : '🔇'}
          </button>
          {screen === 'game' && (
            <button className={styles.settingsBtn} onClick={handleNewGame} title="Settings">
              ⚙️
            </button>
          )}
        </div>
      </header>

      {screen === 'setup' ? (
        <PlayerSetup onStart={handleStart} />
      ) : (
        <main className={styles.main}>
          <Controls
            time={time}
            moves={moves}
            matchedPairs={matchedPairs}
            totalPairs={config.pairs}
            difficulty={difficulty}
            bestScore={isMultiplayer ? null : bestScore}
            onReset={handleReset}
            onChangeDifficulty={handleChangeDifficulty}
          />

          <PlayerBar
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            isMultiplayer={isMultiplayer}
            roundWins={roundWins}
            currentRound={currentRound}
            totalRounds={tournament.bestOf}
            isSeries={isSeries}
          />

          <Board
            cards={cards}
            difficulty={difficulty}
            disabled={flippedIds.length >= 2}
            isMultiplayer={isMultiplayer}
            currentPlayerIndex={currentPlayerIndex}
            onFlip={(id) => { playFlip(); flipCard(id); }}
          />

          <div className={styles.sr} aria-live="polite">
            {status === 'won'
              ? `Game complete! ${moves} moves in ${time} seconds.`
              : isPlaying
                ? `${matchedPairs} of ${config.pairs} pairs found. ${players[currentPlayerIndex].name}'s turn.`
                : ''}
          </div>
        </main>
      )}

      <footer className={styles.footer}>
        Made by Whilo
      </footer>

      {status === 'won' && screen === 'game' && <Confetti />}

      {status === 'won' && screen === 'game' && (
        <WinModal
          moves={moves}
          time={time}
          totalPairs={config.pairs}
          isNewBest={isNewBest}
          players={players}
          isMultiplayer={isMultiplayer}
          isSeries={isSeries}
          currentRound={currentRound}
          totalRounds={tournament.bestOf}
          roundWins={roundWins}
          seriesOver={seriesOver}
          onNextRound={handleNextRound}
          onPlayAgain={handleReset}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
