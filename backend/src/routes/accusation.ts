import type { FastifyPluginAsync } from 'fastify';
import { actionBody, actionResponses, errorResponse } from '../schemas/game.ts';
import { DomainError } from '../services/domain-error.ts';
import type { Engine } from '../services/game.ts';
import { findState, type GameStore } from '../services/game-store.ts';
import { runAction } from '../services/run-action.ts';
import { scenario } from '../services/scenario.ts';
import { buildSummary } from '../services/summary.ts';

const gameIdParams = {
  type: 'object',
  required: ['gameId'],
  properties: { gameId: { type: 'string' } },
} as const;

const accuseBody = {
  ...actionBody(
    {
      suspectId: { type: 'string' },
      evidence: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2, uniqueItems: true },
    },
    ['suspectId', 'evidence'],
  ),
  additionalProperties: false,
} as const;

const timeLine = { type: 'object', required: ['time', 'text'], properties: { time: { type: 'string' }, text: { type: 'string' } } };

const summaryResponse = {
  type: 'object',
  required: ['culprit', 'motive', 'timeline', 'possibleEvidence', 'accusation'],
  properties: {
    culprit: { type: 'object', required: ['id', 'name'], properties: { id: { type: 'string' }, name: { type: 'string' } } },
    motive: { type: 'string' },
    timeline: { type: 'array', items: timeLine },
    possibleEvidence: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'obtained'],
        properties: { id: { type: 'string' }, title: { type: 'string' }, obtained: { type: 'boolean' } },
      },
    },
    accusation: {
      type: ['object', 'null'],
      required: ['suspectId', 'evidence', 'correct'],
      properties: {
        suspectId: { type: 'string' },
        evidence: { type: 'array', items: { type: 'string' } },
        correct: { type: 'boolean' },
      },
    },
  },
} as const;

const accusationRoutes: FastifyPluginAsync<{ engine: Engine; games: GameStore }> = async (app, { engine, games }) => {
  app.post<{ Params: { gameId: string }; Body: { version: number; suspectId: string; evidence: string[] } }>(
    '/games/:gameId/accuse',
    {
      schema: {
        tags: ['games'],
        summary: 'Accuser un suspect avec 2 indices du carnet',
        params: gameIdParams,
        body: accuseBody,
        response: actionResponses,
      },
    },
    async (request) => {
      const { version, suspectId, evidence } = request.body;
      return runAction(engine, games, request.params.gameId, version, { type: 'accuse', suspectId, evidence });
    },
  );

  app.get<{ Params: { gameId: string } }>(
    '/games/:gameId/summary',
    {
      schema: {
        tags: ['games'],
        summary: 'Lire le récapitulatif d’une partie terminée',
        params: gameIdParams,
        response: { 200: summaryResponse, 404: errorResponse, 409: errorResponse },
      },
    },
    async (request) => {
      const state = findState(games, request.params.gameId);

      try {
        return buildSummary(scenario, state);
      } catch (error) {
        if (error instanceof DomainError) {
          error.game = engine.buildView(state);
        }
        throw error;
      }
    },
  );
};

export default accusationRoutes;
