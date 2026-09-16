import { useReducer, useCallback } from 'react';
import type { GameState, GameAction, Difficulty, Player } from '../types/game';
import { generateCards } from '../utils/cards';

const DEFAULT_PLAYERS: Player[] = [{ name: 'Player 1', pairs: 0 }];

function createInitialState(difficulty: Difficulty, players?: Player[]): GameState {
  return {
    cards: generateCards(difficulty),
    flippedIds: [],
    moves: 0,
    difficulty,
    status: 'idle',
    players: (players ?? DEFAULT_PLAYERS).map((p) => ({ ...p, pairs: 0 })),
    currentPlayerIndex: 0,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'FLIP_CARD': {
      const card = state.cards.find((c) => c.id === action.id);
      if (!card || card.isFlipped || card.isMatched || state.flippedIds.length >= 2) {
        return state;
      }

      const newFlippedIds = [...state.flippedIds, action.id];
      const newCards = state.cards.map((c) =>
        c.id === action.id ? { ...c, isFlipped: true } : c
      );

      return {
        ...state,
        cards: newCards,
        flippedIds: newFlippedIds,
        status: state.status === 'idle' ? 'playing' : state.status,
        moves: newFlippedIds.length === 2 ? state.moves + 1 : state.moves,
      };
    }

    case 'MATCH_SUCCESS': {
      const [id1, id2] = state.flippedIds;
      const newCards = state.cards.map((c) =>
        c.id === id1 || c.id === id2
          ? { ...c, isMatched: true, matchedBy: state.currentPlayerIndex }
          : c
      );
      const allMatched = newCards.every((c) => c.isMatched);

      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, pairs: p.pairs + 1 } : p
      );

      return {
        ...state,
        cards: newCards,
        flippedIds: [],
        players: newPlayers,
        status: allMatched ? 'won' : state.status,
        // On match, same player goes again
      };
    }

    case 'MATCH_FAIL': {
      const [id1, id2] = state.flippedIds;
      const newCards = state.cards.map((c) =>
        c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c
      );

      return {
        ...state,
        cards: newCards,
        flippedIds: [],
        // Switch to next player on miss
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
      };
    }

    case 'RESET': {
      const difficulty = action.difficulty ?? state.difficulty;
      const players = action.players ?? state.players;
      return createInitialState(difficulty, players);
    }

    case 'RESTORE':
      return action.state;

    default:
      return state;
  }
}

export function useGameState(initialDifficulty: Difficulty = '4x4') {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialDifficulty,
    (d) => createInitialState(d)
  );

  const flipCard = useCallback((id: string) => {
    dispatch({ type: 'FLIP_CARD', id });
  }, []);

  const resolveMatch = useCallback((isMatch: boolean) => {
    dispatch({ type: isMatch ? 'MATCH_SUCCESS' : 'MATCH_FAIL' });
  }, []);

  const reset = useCallback((difficulty?: Difficulty, players?: Player[]) => {
    dispatch({ type: 'RESET', difficulty, players });
  }, []);

  const restore = useCallback((savedState: GameState) => {
    dispatch({ type: 'RESTORE', state: savedState });
  }, []);

  return { state, flipCard, resolveMatch, reset, restore };
}
