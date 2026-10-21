import { beforeEach, describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.ts';
import { actionBody, actionResponse } from '../src/schemas/game.ts';
import { DomainError } from '../src/services/domain-error.ts';
import type { Engine } from '../src/services/game.ts';
import type { GameStore } from '../src/services/game-store.ts';
import { provisionalEngine } from '../src/services/provisional-engine.ts';
import { runAction } from '../src/services/run-action.ts';

const fakeEngine: Engine = {
  ...provisionalEngine,
  createDie: (_seed, start) => {
    let position = start;
    return {
      die: () => {
        position += 1;
        return 4;
      },
      position: () => position,
    };
  },
  applyAction: (state, action, die) => {
    if (action.type === 'move' && action.roomId === 'locked') {
      throw new DomainError('ROOM_LOCKED', 'La porte est fermée à clé.');
    }
    if (action.type === 'move' && action.roomId === 'bug') {
      state.notebook.push('corrupted');
      throw new Error('engine bug');
    }
    die();
    return {
      state: { ...state, version: state.version + 1 },
      event: { type: 'movement', result: null, text: 'Vous avancez.' },
    };
  },
};

describe('running an action', () => {
  let app: ReturnType<typeof buildApp>;
  let games: GameStore;
  let gameId: string;

  const play = (payload: object, id = gameId) =>
    app.inject({ method: 'POST', url: `/api/games/${id}/test`, payload });

  beforeEach(async () => {
    games = new Map();
    app = buildApp({ logger: false, engine: fakeEngine, games });
    app.post<{ Params: { gameId: string }; Body: { version: number; roomId: string } }>(
      '/api/games/:gameId/test',
      { schema: { body: actionBody({ roomId: { type: 'string' } }, ['roomId']), response: { 200: actionResponse } } },
      async (request) =>
        runAction(fakeEngine, games, request.params.gameId, request.body.version, {
          type: 'move',
          roomId: request.body.roomId,
        }),
    );
    gameId = (await app.inject({ method: 'POST', url: '/api/games' })).json().gameId;
  });

  test('applies the action when the version matches', async () => {
    const response = await play({ version: 0, roomId: 'a' });

    expect(response.statusCode).toBe(200);
    expect(response.json().event.text).toBe('Vous avancez.');
    expect(response.json().game.version).toBe(1);
    expect(games.get(gameId)).toMatchObject({ version: 1, dieState: 1 });
  });

  test('refuses a stale version without changing the state', async () => {
    const before = structuredClone(games.get(gameId));

    const response = await play({ version: 5, roomId: 'a' });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('STALE_VERSION');
    expect(response.json().game.version).toBe(0);
    expect(games.get(gameId)).toEqual(before);
  });

  test('plays a double click only once', async () => {
    const first = await play({ version: 0, roomId: 'a' });
    const second = await play({ version: 0, roomId: 'a' });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(409);
    expect(second.json().game.version).toBe(1);
    expect(games.get(gameId)!.version).toBe(1);
  });

  test('keeps the state unchanged when the engine refuses', async () => {
    const before = structuredClone(games.get(gameId));

    const response = await play({ version: 0, roomId: 'locked' });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('ROOM_LOCKED');
    expect(response.json().game.version).toBe(0);
    expect(games.get(gameId)).toEqual(before);
  });

  test('keeps the state unchanged when the engine crashes', async () => {
    const before = structuredClone(games.get(gameId));

    const response = await play({ version: 0, roomId: 'bug' });

    expect(response.statusCode).toBe(500);
    expect(response.json().error.code).toBe('INTERNAL_ERROR');
    expect(games.get(gameId)).toEqual(before);
  });

  test('requires a version in the body', async () => {
    const response = await play({ roomId: 'a' });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_REQUEST');
  });

  test('returns 404 for an unknown game', async () => {
    const response = await play({ version: 0, roomId: 'a' }, 'p_unknown');

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('GAME_NOT_FOUND');
  });
});
