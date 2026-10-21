import { beforeEach, describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.ts';
import { DomainError } from '../src/services/domain-error.ts';

describe('unified error format', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp({ logger: false });
    app.post(
      '/test/validation',
      { schema: { body: { type: 'object', required: ['seed'], properties: { seed: { type: 'integer' } } } } },
      async () => ({}),
    );
    app.get('/test/locked', async () => {
      const error = new DomainError('ROOM_LOCKED', 'La porte du bureau est fermée à clé.');
      error.game = { gameId: 'p_test', version: 3 };
      throw error;
    });
    app.get('/test/unknown-suspect', async () => {
      throw new DomainError('UNKNOWN_SUSPECT', 'Ce suspect n’existe pas.');
    });
    app.get('/test/not-found', async () => {
      throw new DomainError('GAME_NOT_FOUND', 'Partie introuvable.');
    });
    app.get('/test/bug', async () => {
      throw new TypeError('secret internal detail');
    });
  });

  test('unknown route returns 404', async () => {
    const response = await app.inject({ method: 'GET', url: '/nope' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: { code: 'NOT_FOUND', message: 'Route introuvable.' } });
  });

  test('schema validation error returns 400 INVALID_REQUEST', async () => {
    const response = await app.inject({ method: 'POST', url: '/test/validation', payload: { seed: 'abc' } });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_REQUEST');
    expect(response.json().error.message).toEqual(expect.any(String));
  });

  test('malformed JSON returns 400 INVALID_REQUEST', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/test/validation',
      headers: { 'content-type': 'application/json' },
      payload: '{',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('INVALID_REQUEST');
  });

  test('domain refusal with a game returns 409 with the game', async () => {
    const response = await app.inject({ method: 'GET', url: '/test/locked' });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: { code: 'ROOM_LOCKED', message: 'La porte du bureau est fermée à clé.' },
      game: { gameId: 'p_test', version: 3 },
    });
  });

  test('UNKNOWN_SUSPECT returns 400', async () => {
    const response = await app.inject({ method: 'GET', url: '/test/unknown-suspect' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: { code: 'UNKNOWN_SUSPECT', message: 'Ce suspect n’existe pas.' } });
  });

  test('GAME_NOT_FOUND returns 404', async () => {
    const response = await app.inject({ method: 'GET', url: '/test/not-found' });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('GAME_NOT_FOUND');
  });

  test('unexpected error returns 500 without internal details', async () => {
    const response = await app.inject({ method: 'GET', url: '/test/bug' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur.' } });
    expect(response.body).not.toContain('secret');
  });
});
