export default async function healthRoutes(app) {
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
}
