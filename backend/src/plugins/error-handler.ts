import type { FastifyError, FastifyInstance } from 'fastify';
import { DomainError, type ErrorCode } from '../services/domain-error.ts';

const statusByCode: Partial<Record<ErrorCode, number>> = {
  INVALID_REQUEST: 400,
  UNKNOWN_ROOM: 400,
  UNKNOWN_SUSPECT: 400,
  GAME_NOT_FOUND: 404,
};

export function setErrorHandling(app: FastifyInstance) {
  app.setErrorHandler<FastifyError | DomainError>((error, request, reply) => {
    if (error instanceof DomainError) {
      const status = statusByCode[error.code] ?? 409;
      const body = { error: { code: error.code, message: error.message } };
      return reply.status(status).send(status === 409 && error.game ? { ...body, game: error.game } : body);
    }

    if (error.validation || (error.statusCode && error.statusCode < 500)) {
      return reply
        .status(400)
        .send({ error: { code: 'INVALID_REQUEST', message: `Requête invalide : ${error.message}` } });
    }

    request.log.error(error);
    return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur.' } });
  });

  app.setNotFoundHandler((_request, reply) =>
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Route introuvable.' } }),
  );
}
