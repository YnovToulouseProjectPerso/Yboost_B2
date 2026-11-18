import { describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.ts';
import type { GameState } from '../src/services/game.ts';
import type { GameStore } from '../src/services/game-store.ts';

// Rooms of the provisional scenario: hall leads to cuisine, couloir and ecurie; office is behind couloir and needs key_office
async function setup(changes: Partial<GameState> = {}) {
  const games: GameStore = new Map();
  const app = buildApp({ logger: false, games });
  const created = (await app.inject({ method: 'POST', url: '/api/games' })).json();
  Object.assign(games.get(created.gameId)!, changes);
  return { app, games, gameId: created.gameId as string, created };
}

function move(app: Awaited<ReturnType<typeof setup>>['app'], gameId: string, payload: object) {
  return app.inject({ method: 'POST', url: `/api/games/${gameId}/move`, payload });
}

describe('POST /api/games/:gameId/move', () => {
  test('a new game starts in the hall with its adjacent rooms', async () => {
    const { created } = await setup();

    expect(created.currentRoom).toMatchObject({ id: 'hall', name: 'Salle commune' });
    expect(created.adjacentRooms).toEqual([
      { id: 'cuisine', name: 'Cuisine', locked: false },
      { id: 'couloir', name: 'Couloir des chambres', locked: false },
      { id: 'ecurie', name: 'Écurie', locked: false },
    ]);
  });

  test('moves to an adjacent room and uses one action', async () => {
    const { app, games, gameId } = await setup();

    const response = await move(app, gameId, { version: 0, roomId: 'cuisine' });
    const { event, game } = response.json();

    expect(response.statusCode).toBe(200);
    expect(event).toEqual({ type: 'movement', result: 'success', text: expect.stringContaining('Cuisine') });
    expect(game).toMatchObject({ version: 1, remainingActions: 11, time: '1h30', status: 'in_progress' });
    expect(game.currentRoom.id).toBe('cuisine');
    expect(game.adjacentRooms.map((room: { id: string }) => room.id)).toEqual(['hall', 'cellar']);
    expect(game.lastEvent).toEqual(event);
    expect(games.get(gameId)).toMatchObject({ currentRoom: 'cuisine', version: 1, remainingActions: 11 });
  });

  test('chains two moves with the version returned by the first one', async () => {
    const { app, gameId } = await setup();

    await move(app, gameId, { version: 0, roomId: 'cuisine' });
    const response = await move(app, gameId, { version: 1, roomId: 'cellar' });

    expect(response.statusCode).toBe(200);
    expect(response.json().game).toMatchObject({ version: 2, remainingActions: 10, time: '2h00' });
    expect(response.json().game.currentRoom.id).toBe('cellar');
  });

  test('opens the office for good with its key', async () => {
    const { app, games, gameId } = await setup({ currentRoom: 'couloir', items: ['key_office'] });

    const response = await move(app, gameId, { version: 0, roomId: 'office' });

    expect(response.statusCode).toBe(200);
    expect(response.json().event.text).toMatch(/^Vous déverrouillez la porte\./);
    expect(response.json().game.currentRoom.id).toBe('office');
    expect(games.get(gameId)!.unlockedRooms).toEqual(['office']);
  });

  test('refuses a room that is not adjacent with 409 ROOM_NOT_ADJACENT and the unchanged game', async () => {
    const { app, games, gameId } = await setup();
    const before = structuredClone(games.get(gameId));

    const response = await move(app, gameId, { version: 0, roomId: 'cellar' });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body.error).toEqual({ code: 'ROOM_NOT_ADJACENT', message: expect.any(String) });
    expect(body.game).toMatchObject({ version: 0, remainingActions: 12, time: '1h00' });
    expect(body.game.currentRoom.id).toBe('hall');
    expect(games.get(gameId)).toEqual(before);
  });

  test('refuses the office without the key with 409 ROOM_LOCKED and the unchanged game', async () => {
    const { app, games, gameId } = await setup({ currentRoom: 'couloir' });
    const before = structuredClone(games.get(gameId));

    const response = await move(app, gameId, { version: 0, roomId: 'office' });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body.error).toEqual({ code: 'ROOM_LOCKED', message: 'La porte du bureau est fermée à clé.' });
    expect(body.game.adjacentRooms).toContainEqual({ id: 'office', name: 'Bureau d’Armand', locked: true });
    expect(games.get(gameId)).toEqual(before);
  });

  test('refuses an unknown room with 400 UNKNOWN_ROOM and the unchanged state', async () => {
    const { app, games, gameId } = await setup();
    const before = structuredClone(games.get(gameId));

    const response = await move(app, gameId, { version: 0, roomId: 'grenier' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: { code: 'UNKNOWN_ROOM', message: expect.any(String) } });
    expect(games.get(gameId)).toEqual(before);
  });

  test.each([
    ['a missing roomId', { version: 0 }],
    ['a missing version', { roomId: 'cuisine' }],
    ['a roomId that cannot be read as text', { version: 0, roomId: { id: 'cuisine' } }],
    ['a negative version', { version: -1, roomId: 'cuisine' }],
  ])('refuses %s with 400 INVALID_REQUEST and the unchanged state', async (_label, payload) => {
    const { app, games, gameId } = await setup();
    const before = structuredClone(games.get(gameId));

    const response = await move(app, gameId, payload);

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_REQUEST');
    expect(games.get(gameId)).toEqual(before);
  });

  // Fastify's default Ajv options strip the fields that additionalProperties: false does not allow
  test('ignores an extra field instead of passing it to the engine', async () => {
    const { app, gameId } = await setup();

    const response = await move(app, gameId, { version: 0, roomId: 'cuisine', remainingActions: 99 });

    expect(response.statusCode).toBe(200);
    expect(response.json().game.remainingActions).toBe(11);
  });

  test('refuses a wrong version with 409 STALE_VERSION and the unchanged state', async () => {
    const { app, games, gameId } = await setup();
    const before = structuredClone(games.get(gameId));

    const response = await move(app, gameId, { version: 3, roomId: 'cuisine' });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('STALE_VERSION');
    expect(response.json().game.version).toBe(0);
    expect(games.get(gameId)).toEqual(before);
  });

  test('refuses a double click: the second identical request gets 409 STALE_VERSION', async () => {
    const { app, games, gameId } = await setup();

    const first = await move(app, gameId, { version: 0, roomId: 'cuisine' });
    const second = await move(app, gameId, { version: 0, roomId: 'cuisine' });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(409);
    expect(second.json().error.code).toBe('STALE_VERSION');
    expect(games.get(gameId)).toMatchObject({ version: 1, remainingActions: 11 });
  });

  test('answers 404 GAME_NOT_FOUND for an unknown game', async () => {
    const { app } = await setup();

    const response = await move(app, 'p_unknown', { version: 0, roomId: 'cuisine' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('GAME_NOT_FOUND');
  });
});
