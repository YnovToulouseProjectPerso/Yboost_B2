import type { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string' },
            },
          },
        },
      },
    },
    async () => ({ status: 'ok' }),
  );
};

export default healthRoutes;
