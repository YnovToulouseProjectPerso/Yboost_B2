import Fastify from 'fastify';
import corsPlugin from './plugins/cors.ts';
import { setErrorHandling } from './plugins/error-handler.ts';
import healthRoutes from './routes/health.ts';

export function buildApp({ frontendOrigin = 'http://localhost:5173', logger = true } = {}) {
  const app = Fastify({ logger });

  setErrorHandling(app);
  app.register(corsPlugin, { origin: frontendOrigin });
  app.register(healthRoutes, { prefix: '/api' });

  return app;
}
