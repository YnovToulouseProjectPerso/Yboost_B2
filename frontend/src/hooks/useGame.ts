import { useEffect, useRef, useState } from 'react';
import * as api from '../services/api.ts';
import { ApiError } from '../services/api.ts';
import type { ActionResult, Game, Summary } from '../services/game.ts';

export const GAME_ID_KEY = 'gameId';

export type GameError = { message: string; retry?: () => void };

export type GameActions = {
  newGame: (seed?: number) => void;
  move: (roomId: string) => void;
  search: () => void;
  interrogate: (suspectId: string, clueId?: string) => void;
  accuse: (suspectId: string, evidence: string[]) => void;
  loadSummary: () => void;
};

export type ScreenProps = { game: Game; loading: boolean; actions: GameActions };

export function useGame() {
  const [game, setGame] = useState<Game | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GameError | null>(null);
  const busy = useRef(false);

  function show(next: Game) {
    sessionStorage.setItem(GAME_ID_KEY, next.gameId);
    setGame(next);
  }

  function leave() {
    sessionStorage.removeItem(GAME_ID_KEY);
    setGame(null);
    setSummary(null);
  }

  function report(failure: ApiError, retry: () => void) {
    if (failure.game) show(failure.game);
    if (failure.code === 'GAME_NOT_FOUND') leave();
    if (failure.code === 'STALE_VERSION') return;
    setError(failure.type === 'network' ? { message: failure.message, retry } : { message: failure.message });
  }

  async function run<T>(call: () => Promise<T>, apply: (data: T) => void) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError(null);
    try {
      apply(await call());
    } catch (failure) {
      if (!(failure instanceof ApiError)) throw failure;
      report(failure, () => void run(call, apply));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  function act(call: (current: Game) => Promise<ActionResult>) {
    if (!game) return;
    const current = game;
    void run(
      () => call(current),
      (result) => show(result.game),
    );
  }

  useEffect(() => {
    const storedId = sessionStorage.getItem(GAME_ID_KEY);
    if (storedId) void run(() => api.getGame(storedId), show);
  }, []);

  const actions: GameActions = {
    newGame: (seed) =>
      void run(
        () => api.createGame(seed),
        (created) => {
          setSummary(null);
          show(created);
        },
      ),
    move: (roomId) => act((current) => api.move(current.gameId, current.version, roomId)),
    search: () => act((current) => api.search(current.gameId, current.version)),
    interrogate: (suspectId, clueId) =>
      act((current) => api.interrogate(current.gameId, current.version, suspectId, clueId)),
    accuse: (suspectId, evidence) =>
      act((current) => api.accuse(current.gameId, current.version, suspectId, evidence)),
    loadSummary: () => {
      if (!game) return;
      const gameId = game.gameId;
      void run(() => api.getSummary(gameId), setSummary);
    },
  };

  return { game, summary, loading, error, actions };
}
