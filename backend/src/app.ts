import Fastify from 'fastify';
import corsPlugin from './plugins/cors.ts';
import { setDocs } from './plugins/docs.ts';
import { setErrorHandling } from './plugins/error-handler.ts';
import gameRoutes from './routes/games.ts';
import healthRoutes from './routes/health.ts';
import type { Engine } from './services/game.ts';
import type { GameStore } from './services/game-store.ts';
import { provisionalEngine } from './services/provisional-engine.ts';

type AppOptions = {
  frontendOrigin?: string;
  logger?: boolean;
  engine?: Engine;
  games?: GameStore;
};

export function buildApp({
  frontendOrigin = 'http://localhost:5173',
  logger = true,
  engine = provisionalEngine,
  games = new Map(),
}: AppOptions = {}) {
  const app = Fastify({ logger });

  setErrorHandling(app);
  setDocs(app);
  app.register(corsPlugin, { origin: frontendOrigin });
  app.register(healthRoutes, { prefix: '/api' });
  app.register(gameRoutes, { prefix: '/api', engine, games });

  return app;
}
