import { describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.ts';
import type { GameStore } from '../src/services/game-store.ts';

function setup() {
  const games: GameStore = new Map();
  return { app: buildApp({ logger: false, games }), games };
}

describe('POST /api/games', () => {
  test('creates a new game without a body', async () => {
    const { app, games } = setup();

    const response = await app.inject({ method: 'POST', url: '/api/games' });
    const game = response.json();

    expect(response.statusCode).toBe(201);
    expect(game).toMatchObject({ version: 0, remainingActions: 12, time: '1h00', status: 'in_progress' });
    expect(game.currentRoom.id).toBe('hall');
    expect(game.lastEvent.type).toBe('introduction');
    expect(Number.isInteger(game.seed) && game.seed > 0).toBe(true);
    expect(games.has(game.gameId)).toBe(true);
  });

  test('keeps the given seed', async () => {
    const { app } = setup();

    const response = await app.inject({ method: 'POST', url: '/api/games', payload: { seed: 421337 } });

    expect(response.statusCode).toBe(201);
    expect(response.json().seed).toBe(421337);
  });

  test.each([{ seed: 'abc' }, { seed: 0 }, { seed: 1.5 }])('rejects an invalid seed %o', async (payload) => {
    const { app, games } = setup();

    const response = await app.inject({ method: 'POST', url: '/api/games', payload });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_REQUEST');
    expect(games.size).toBe(0);
  });

  test('gives each game its own id and its own state', async () => {
    const { app, games } = setup();

    const first = (await app.inject({ method: 'POST', url: '/api/games' })).json();
    const second = (await app.inject({ method: 'POST', url: '/api/games' })).json();
    games.get(first.gameId)!.notebook.push('i_a1');
    games.get(first.gameId)!.log.push({ version: 1, type: 'search', result: 'success', text: '…' });

    expect(first.gameId).not.toBe(second.gameId);
    expect(games.get(second.gameId)!.notebook).toEqual([]);
    expect(games.get(second.gameId)!.log).toHaveLength(1);
  });
});

describe('GET /api/games/:gameId', () => {
  test('returns the stored game without changing it', async () => {
    const { app } = setup();
    const created = (await app.inject({ method: 'POST', url: '/api/games' })).json();

    const first = await app.inject({ method: 'GET', url: `/api/games/${created.gameId}` });
    const second = await app.inject({ method: 'GET', url: `/api/games/${created.gameId}` });

    expect(first.statusCode).toBe(200);
    expect(first.json()).toEqual(created);
    expect(second.json().version).toBe(0);
  });

  test('returns 404 GAME_NOT_FOUND for an unknown id', async () => {
    const { app } = setup();

    const response = await app.inject({ method: 'GET', url: '/api/games/p_unknown' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('GAME_NOT_FOUND');
  });
});
