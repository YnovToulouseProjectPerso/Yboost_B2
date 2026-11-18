import type { FastifyPluginAsync } from 'fastify';
import { actionBody, actionResponses } from '../schemas/game.ts';
import type { Engine } from '../services/game.ts';
import type { GameStore } from '../services/game-store.ts';
import { runAction } from '../services/run-action.ts';

const gameIdParams = {
  type: 'object',
  required: ['gameId'],
  properties: { gameId: { type: 'string' } },
} as const;

const moveBody = {
  ...actionBody({ roomId: { type: 'string' } }, ['roomId']),
  additionalProperties: false,
} as const;

const moveRoutes: FastifyPluginAsync<{ engine: Engine; games: GameStore }> = async (app, { engine, games }) => {
  app.post<{ Params: { gameId: string }; Body: { version: number; roomId: string } }>(
    '/games/:gameId/move',
    {
      schema: {
        tags: ['games'],
        summary: 'Aller dans une pièce adjacente',
        params: gameIdParams,
        body: moveBody,
        response: actionResponses,
      },
    },
    async (request) => {
      const { version, roomId } = request.body;
      return runAction(engine, games, request.params.gameId, version, { type: 'move', roomId });
    },
  );
};

export default moveRoutes;
