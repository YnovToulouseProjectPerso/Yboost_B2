import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import * as api from '../services/api.ts';
import { ApiError, NETWORK_MESSAGE } from '../services/api.ts';
import type { Game } from '../services/game.ts';
import { GAME_ID_KEY, useGame } from './useGame.ts';

vi.mock(import('../services/api.ts'), async (importOriginal) => ({
  ...(await importOriginal()),
  createGame: vi.fn(),
  getGame: vi.fn(),
  move: vi.fn(),
  search: vi.fn(),
  interrogate: vi.fn(),
  accuse: vi.fn(),
  getSummary: vi.fn(),
}));

function createGame(version: number, changes: Partial<Game> = {}): Game {
  return {
    gameId: 'p_test',
    seed: 42,
    version,
    status: 'in_progress',
    remainingActions: 12 - version,
    time: '2h30',
    currentRoom: { id: 'a', name: 'Pièce A', description: '…', fullySearched: false },
    adjacentRooms: [
      { id: 'b', name: 'Pièce B', locked: false },
      { id: 'c', name: 'Pièce C', locked: true },
    ],
    presentSuspects: [{ id: 's1', name: 'Suspect Un', role: '…' }],
    notebook: [],
    items: [],
    lastEvent: { type: 'introduction', result: null, text: '1h00.' },
    suspects: [{ id: 's1', name: 'Suspect Un', role: '…' }],
    log: [],
    ...changes,
  };
}

const rejection = (code: string, message: string, game?: Game) =>
  new ApiError('rejection', message, { status: code === 'GAME_NOT_FOUND' ? 404 : 409, code, game });

async function startedGame() {
  vi.mocked(api.createGame).mockResolvedValue(createGame(3));
  const hook = renderHook(() => useGame());
  await act(async () => hook.result.current.actions.newGame());
  return hook;
}

afterEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('useGame', () => {
  test('newGame sets loading during the call, then fills the game', async () => {
    let resolve!: (game: Game) => void;
    vi.mocked(api.createGame).mockReturnValue(new Promise((done) => (resolve = done)));
    const { result } = renderHook(() => useGame());

    act(() => result.current.actions.newGame(42));

    expect(result.current.loading).toBe(true);
    expect(api.createGame).toHaveBeenCalledWith(42);

    await act(async () => resolve(createGame(0)));

    expect(result.current.loading).toBe(false);
    expect(result.current.game?.version).toBe(0);
    expect(sessionStorage.getItem(GAME_ID_KEY)).toBe('p_test');
  });

  test('replaces the game with the one of an accepted action, sending the displayed version', async () => {
    const { result } = await startedGame();
    const moved = createGame(4, { currentRoom: { id: 'b', name: 'Pièce B', description: '…', fullySearched: false } });
    vi.mocked(api.move).mockResolvedValue({ event: moved.lastEvent, game: moved });

    await act(async () => result.current.actions.move('b'));

    expect(api.move).toHaveBeenCalledWith('p_test', 3, 'b');
    expect(result.current.game).toBe(moved);
    expect(result.current.error).toBeNull();
  });

  test('resyncs the game and shows the message on a ROOM_LOCKED refusal', async () => {
    const { result } = await startedGame();
    const stored = createGame(3, { time: '2h30' });
    vi.mocked(api.move).mockRejectedValue(rejection('ROOM_LOCKED', 'La porte est fermée à clé.', stored));

    await act(async () => result.current.actions.move('c'));

    expect(result.current.game).toBe(stored);
    expect(result.current.error?.message).toBe('La porte est fermée à clé.');
  });

  test('resyncs silently on STALE_VERSION', async () => {
    const { result } = await startedGame();
    const latest = createGame(5);
    vi.mocked(api.search).mockRejectedValue(rejection('STALE_VERSION', 'Version périmée.', latest));

    await act(async () => result.current.actions.search());

    expect(result.current.game).toBe(latest);
    expect(result.current.error).toBeNull();
  });

  test('offers a retry when the server is unreachable', async () => {
    const { result } = await startedGame();
    const searched = createGame(4);
    vi.mocked(api.search)
      .mockRejectedValueOnce(new ApiError('network', NETWORK_MESSAGE))
      .mockResolvedValueOnce({ event: searched.lastEvent, game: searched });

    await act(async () => result.current.actions.search());

    expect(result.current.error?.message).toBe(NETWORK_MESSAGE);
    expect(result.current.error?.retry).toBeTypeOf('function');

    await act(async () => result.current.error?.retry?.());

    expect(api.search).toHaveBeenCalledTimes(2);
    expect(result.current.game).toBe(searched);
    expect(result.current.error).toBeNull();
  });

  test('shows the unexpected message as is', async () => {
    const { result } = await startedGame();
    vi.mocked(api.search).mockRejectedValue(new ApiError('unexpected', 'Réponse inattendue du serveur'));

    await act(async () => result.current.actions.search());

    expect(result.current.error).toEqual({ message: 'Réponse inattendue du serveur' });
    expect(result.current.game?.version).toBe(3);
  });

  test('reloads the stored game on mount', async () => {
    sessionStorage.setItem(GAME_ID_KEY, 'p_test');
    vi.mocked(api.getGame).mockResolvedValue(createGame(6));

    const { result } = renderHook(() => useGame());

    await waitFor(() => expect(result.current.game?.version).toBe(6));
    expect(api.getGame).toHaveBeenCalledWith('p_test');
  });

  test('goes back home with a message when the stored game is not found', async () => {
    sessionStorage.setItem(GAME_ID_KEY, 'p_old');
    vi.mocked(api.getGame).mockRejectedValue(rejection('GAME_NOT_FOUND', 'Cette partie n’existe pas.'));

    const { result } = renderHook(() => useGame());

    await waitFor(() => expect(result.current.error?.message).toBe('Cette partie n’existe pas.'));
    expect(result.current.game).toBeNull();
    expect(sessionStorage.getItem(GAME_ID_KEY)).toBeNull();
  });

  test('sends a single request for two close calls', async () => {
    const { result } = await startedGame();
    const searched = createGame(4);
    vi.mocked(api.search).mockResolvedValue({ event: searched.lastEvent, game: searched });

    await act(async () => {
      result.current.actions.search();
      result.current.actions.search();
    });

    expect(api.search).toHaveBeenCalledTimes(1);
  });

  test('passes the optional clue, the evidence and loads the summary', async () => {
    const { result } = await startedGame();
    const over = createGame(4, { status: 'defeat' });
    const summary = {
      culprit: { id: 's2', name: 'Suspect Deux' },
      motive: '…',
      timeline: [],
      possibleEvidence: [],
      accusation: { suspectId: 's1', evidence: ['i_a1', 'i_b1'], correct: false },
    };
    vi.mocked(api.interrogate).mockResolvedValue({ event: over.lastEvent, game: createGame(4) });
    vi.mocked(api.accuse).mockResolvedValue({ event: over.lastEvent, game: over });
    vi.mocked(api.getSummary).mockResolvedValue(summary);

    await act(async () => result.current.actions.interrogate('s1'));
    await act(async () => result.current.actions.accuse('s1', ['i_a1', 'i_b1']));
    await act(async () => result.current.actions.loadSummary());

    expect(api.interrogate).toHaveBeenCalledWith('p_test', 3, 's1', undefined);
    expect(api.accuse).toHaveBeenCalledWith('p_test', 4, 's1', ['i_a1', 'i_b1']);
    expect(api.getSummary).toHaveBeenCalledWith('p_test');
    expect(result.current.summary).toBe(summary);
  });
});
