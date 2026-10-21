import { buildApp } from './app.js';
import { config } from './config/env.js';

const app = buildApp({ frontendOrigin: config.frontendOrigin });

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
