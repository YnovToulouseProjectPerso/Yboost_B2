import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as api from './api.ts';
import { ApiError, NETWORK_MESSAGE, UNEXPECTED_MESSAGE } from './api.ts';

const game = { gameId: 'p_test', version: 3 };
const fetchMock = vi.fn<typeof fetch>();

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function failure(call: Promise<unknown>) {
  const error = await call.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('request', () => {
  test('raises a network error when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await failure(api.getGame('p_test'));

    expect(error.type).toBe('network');
    expect(error.message).toBe(NETWORK_MESSAGE);
  });

  test('raises a network error when the dev proxy answers 500 without JSON', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    expect((await failure(api.getGame('p_test'))).type).toBe('network');
  });

  test('raises a rejection carrying code, message, status and game on a 409', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(409, { error: { code: 'ROOM_LOCKED', message: 'La porte est fermée à clé.' }, game }),
    );

    const error = await failure(api.move('p_test', 3, 'c'));

    expect(error).toMatchObject({
      type: 'rejection',
      status: 409,
      code: 'ROOM_LOCKED',
      message: 'La porte est fermée à clé.',
      game,
    });
  });

  test('keeps the code of a 404 GAME_NOT_FOUND rejection', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { error: { code: 'GAME_NOT_FOUND', message: 'Introuvable.' } }));

    const error = await failure(api.getGame('p_old'));

    expect(error).toMatchObject({ type: 'rejection', status: 404, code: 'GAME_NOT_FOUND', game: undefined });
  });

  test('raises an unexpected error and logs the detail when a 200 is HTML', async () => {
    fetchMock.mockResolvedValue(new Response('<!doctype html><p>Proxy</p>', { status: 200 }));

    const error = await failure(api.getGame('p_test'));

    expect(error.type).toBe('unexpected');
    expect(error.message).toBe(UNEXPECTED_MESSAGE);
    expect(console.error).toHaveBeenCalled();
  });

  test('raises an unexpected error when the JSON has neither the data nor an error', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { hello: 'world' }));

    expect((await failure(api.getGame('p_test'))).type).toBe('unexpected');
  });

  test('raises an unexpected error when a refusal has no error body', async () => {
    fetchMock.mockResolvedValue(jsonResponse(502, { message: 'Bad gateway' }));

    expect((await failure(api.getGame('p_test'))).type).toBe('unexpected');
  });

  test('returns the data as received on a valid 200', async () => {
    const result = { event: { type: 'search', result: 'failure', text: 'Rien.' }, game };
    fetchMock.mockResolvedValue(jsonResponse(200, result));

    await expect(api.search('p_test', 3)).resolves.toEqual(result);
  });
});

describe('routes', () => {
  const result = { event: { type: 'movement', result: null, text: '…' }, game };

  test.each([
    ['createGame', () => api.createGame(42), 'POST', '/api/games', { seed: 42 }, game],
    ['createGame without seed', () => api.createGame(), 'POST', '/api/games', {}, game],
    ['getGame', () => api.getGame('p_test'), 'GET', '/api/games/p_test', undefined, game],
    ['move', () => api.move('p_test', 3, 'b'), 'POST', '/api/games/p_test/move', { version: 3, roomId: 'b' }, result],
    ['search', () => api.search('p_test', 3), 'POST', '/api/games/p_test/search', { version: 3 }, result],
    [
      'interrogate',
      () => api.interrogate('p_test', 3, 's1', 'i_a1'),
      'POST',
      '/api/games/p_test/interrogate',
      { version: 3, suspectId: 's1', clueId: 'i_a1' },
      result,
    ],
    [
      'interrogate without clue',
      () => api.interrogate('p_test', 3, 's1'),
      'POST',
      '/api/games/p_test/interrogate',
      { version: 3, suspectId: 's1' },
      result,
    ],
    [
      'accuse',
      () => api.accuse('p_test', 3, 's2', ['i_a1', 'i_a2']),
      'POST',
      '/api/games/p_test/accuse',
      { version: 3, suspectId: 's2', evidence: ['i_a1', 'i_a2'] },
      result,
    ],
    ['getSummary', () => api.getSummary('p_test'), 'GET', '/api/games/p_test/summary', undefined, { culprit: {} }],
  ])('%s calls the contract route', async (_name, call, method, url, body, response) => {
    fetchMock.mockResolvedValue(jsonResponse(200, response));

    await call();

    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(url);
    expect(init?.method).toBe(method);
    expect(init?.body === undefined ? undefined : JSON.parse(init.body as string)).toEqual(body);
  });
});
