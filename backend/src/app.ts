import Fastify from 'fastify';
import corsPlugin from './plugins/cors.ts';
import healthRoutes from './routes/health.ts';

export function buildApp({ frontendOrigin = 'http://localhost:5173' } = {}) {
  const app = Fastify({ logger: true });

  app.register(corsPlugin, { origin: frontendOrigin });
  app.register(healthRoutes, { prefix: '/api' });

  return app;
}
