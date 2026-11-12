import { describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.ts';
import type { GameStore } from '../src/services/game-store.ts';

// Ids of the provisional scenario: s_marchand is guilty, i_gant and i_lettre are evidence against him
async function setup(notebook = ['i_gant', 'i_lettre', 'i_bougie']) {
  const games: GameStore = new Map();
  const app = buildApp({ logger: false, games });
  const { gameId } = (await app.inject({ method: 'POST', url: '/api/games' })).json();
  games.get(gameId)!.notebook = notebook;
  return { app, games, gameId };
}

function accuse(app: Awaited<ReturnType<typeof setup>>['app'], gameId: string, payload: object) {
  return app.inject({ method: 'POST', url: `/api/games/${gameId}/accuse`, payload });
}

describe('POST /api/games/:gameId/accuse', () => {
  test('ends the game in victory without consuming an action', async () => {
    const { app, gameId } = await setup();

    const response = await accuse(app, gameId, { version: 0, suspectId: 's_marchand', evidence: ['i_gant', 'i_lettre'] });
    const { event, game } = response.json();

    expect(response.statusCode).toBe(200);
    expect(event).toMatchObject({ type: 'accusation', result: 'victory' });
    expect(game).toMatchObject({ status: 'victory', version: 1, remainingActions: 12 });
  });

  test('answers a wrong accusation with a 200 defeat', async () => {
    const { app, gameId } = await setup();

    const response = await accuse(app, gameId, { version: 0, suspectId: 's_servante', evidence: ['i_gant', 'i_lettre'] });

    expect(response.statusCode).toBe(200);
    expect(response.json().event.result).toBe('defeat');
    expect(response.json().game.status).toBe('defeat');
  });

  test.each([
    ['3 clues', ['i_gant', 'i_lettre', 'i_bougie']],
    ['the same clue twice', ['i_gant', 'i_gant']],
  ])('refuses %s with 400 INVALID_REQUEST', async (_label, evidence) => {
    const { app, games, gameId } = await setup();
    const before = structuredClone(games.get(gameId));

    const response = await accuse(app, gameId, { version: 0, suspectId: 's_marchand', evidence });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_REQUEST');
    expect(games.get(gameId)).toEqual(before);
  });

  test('refuses a clue that is not owned with 409 CLUE_NOT_OWNED and the unchanged game', async () => {
    const { app, games, gameId } = await setup(['i_gant']);
    const before = structuredClone(games.get(gameId));

    const response = await accuse(app, gameId, { version: 0, suspectId: 's_marchand', evidence: ['i_gant', 'i_lettre'] });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body.error).toEqual({ code: 'CLUE_NOT_OWNED', message: expect.any(String) });
    expect(body.game).toMatchObject({ status: 'in_progress', version: 0 });
    expect(games.get(gameId)).toEqual(before);
  });

  test('refuses an unknown suspect with 400 UNKNOWN_SUSPECT', async () => {
    const { app, gameId } = await setup();

    const response = await accuse(app, gameId, { version: 0, suspectId: 's_fantome', evidence: ['i_gant', 'i_lettre'] });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('UNKNOWN_SUSPECT');
  });

  test('refuses a wrong version with 409 STALE_VERSION and the unchanged state', async () => {
    const { app, games, gameId } = await setup();
    const before = structuredClone(games.get(gameId));

    const response = await accuse(app, gameId, { version: 5, suspectId: 's_marchand', evidence: ['i_gant', 'i_lettre'] });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('STALE_VERSION');
    expect(games.get(gameId)).toEqual(before);
  });

  test('refuses any action once the game is over with 409 GAME_OVER', async () => {
    const { app, gameId } = await setup();
    await accuse(app, gameId, { version: 0, suspectId: 's_servante', evidence: ['i_gant', 'i_lettre'] });

    const response = await accuse(app, gameId, { version: 1, suspectId: 's_marchand', evidence: ['i_gant', 'i_lettre'] });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('GAME_OVER');
    expect(response.json().game.status).toBe('defeat');
  });
});

describe('GET /api/games/:gameId/summary', () => {
  test('refuses a game in progress with 409 GAME_IN_PROGRESS and the game', async () => {
    const { app, games, gameId } = await setup();
    const before = structuredClone(games.get(gameId));

    const response = await app.inject({ method: 'GET', url: `/api/games/${gameId}/summary` });

    expect(response.statusCode).toBe(409);
    expect(response.json().error.code).toBe('GAME_IN_PROGRESS');
    expect(response.json().game.status).toBe('in_progress');
    expect(games.get(gameId)).toEqual(before);
  });

  test('returns the summary of a finished game without changing it', async () => {
    const { app, games, gameId } = await setup(['i_gant', 'i_bougie']);
    await accuse(app, gameId, { version: 0, suspectId: 's_marchand', evidence: ['i_gant', 'i_bougie'] });
    const before = structuredClone(games.get(gameId));

    const response = await app.inject({ method: 'GET', url: `/api/games/${gameId}/summary` });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      culprit: { id: 's_marchand', name: 'Le marchand' },
      motive: expect.any(String),
      timeline: [
        { time: expect.any(String), text: expect.any(String) },
        { time: expect.any(String), text: expect.any(String) },
      ],
      possibleEvidence: [
        { id: 'i_gant', title: 'Gant taché de cire', obtained: true },
        { id: 'i_lettre', title: 'Lettre de créance déchirée', obtained: false },
      ],
      accusation: { suspectId: 's_marchand', evidence: ['i_gant', 'i_bougie'], correct: false },
    });
    expect(games.get(gameId)).toEqual(before);
  });

  test('answers an unknown game with 404 GAME_NOT_FOUND', async () => {
    const { app } = await setup();

    const response = await app.inject({ method: 'GET', url: '/api/games/p_inconnu/summary' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('GAME_NOT_FOUND');
  });
});

describe('Swagger', () => {
  test('documents both routes with their schemas', async () => {
    const { app } = await setup();
    const { paths } = (await app.inject({ method: 'GET', url: '/documentation/json' })).json();

    expect(paths['/api/games/{gameId}/accuse'].post.requestBody).toBeDefined();
    expect(Object.keys(paths['/api/games/{gameId}/accuse'].post.responses)).toEqual(['200', '400', '404', '409']);
    expect(Object.keys(paths['/api/games/{gameId}/summary'].get.responses)).toEqual(['200', '404', '409']);
  });
});
