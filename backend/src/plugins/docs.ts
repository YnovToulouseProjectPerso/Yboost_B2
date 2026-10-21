import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { sharedSchemas } from '../schemas/game.ts';

export function setDocs(app: FastifyInstance) {
  for (const schema of sharedSchemas) {
    app.addSchema(schema);
  }

  app.register(swagger, {
    openapi: {
      info: {
        title: 'La Dernière Auberge — API du jeu',
        description: 'API du jeu d’enquête : créer une partie, la lire et jouer ses actions.',
        version: '0.1.0',
      },
    },
    refResolver: {
      buildLocalReference: (json, _baseUri, _fragment, i) => (typeof json.$id === 'string' ? json.$id : `def-${i}`),
    },
  });
  app.register(swaggerUi, { routePrefix: '/documentation' });
}
