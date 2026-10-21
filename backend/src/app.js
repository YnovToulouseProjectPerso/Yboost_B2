import Fastify from 'fastify';
import corsPlugin from './plugins/cors.js';
import healthRoutes from './routes/health.js';

export function buildApp({ frontendOrigin = 'http://localhost:5173' } = {}) {
  const app = Fastify({ logger: true });

  app.register(corsPlugin, { origin: frontendOrigin });
  app.register(healthRoutes, { prefix: '/api' });

  return app;
}
