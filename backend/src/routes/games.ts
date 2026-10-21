import { randomInt } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { errorResponse, gameResponse } from '../schemas/game.ts';
import type { Engine } from '../services/game.ts';
import { findState, type GameStore } from '../services/game-store.ts';

const gameIdParams = {
  type: 'object',
  required: ['gameId'],
  properties: { gameId: { type: 'string' } },
} as const;

const gameRoutes: FastifyPluginAsync<{ engine: Engine; games: GameStore }> = async (app, { engine, games }) => {
  app.post<{ Body: { seed?: number } }>(
    '/games',
    {
      schema: {
        tags: ['games'],
        summary: 'Créer une partie',
        body: { type: 'object', properties: { seed: { type: 'integer', minimum: 1 } } },
        response: { 201: gameResponse, 400: errorResponse },
      },
      preValidation: async (request) => {
        request.body ??= {};
      },
    },
    async (request, reply) => {
      const state = engine.createState(request.body.seed ?? randomInt(1, 2 ** 31));
      games.set(state.gameId, state);
      return reply.status(201).send(engine.buildView(state));
    },
  );

  app.get<{ Params: { gameId: string } }>(
    '/games/:gameId',
    {
      schema: {
        tags: ['games'],
        summary: 'Lire une partie',
        params: gameIdParams,
        response: { 200: gameResponse, 404: errorResponse },
      },
    },
    async (request) => engine.buildView(findState(games, request.params.gameId)),
  );
};

export default gameRoutes;
