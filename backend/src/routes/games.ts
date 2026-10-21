import { randomInt } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { gameSchema } from '../schemas/game.ts';
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
        body: { type: 'object', properties: { seed: { type: 'integer', minimum: 1 } } },
        response: { 201: gameSchema },
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
    { schema: { params: gameIdParams, response: { 200: gameSchema } } },
    async (request) => engine.buildView(findState(games, request.params.gameId)),
  );
};

export default gameRoutes;
