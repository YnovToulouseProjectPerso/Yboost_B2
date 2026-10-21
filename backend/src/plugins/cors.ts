import cors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';

const corsPlugin: FastifyPluginAsync<{ origin: string }> = async (app, options) => {
  await app.register(cors, {
    origin: options.origin,
  });
};

export default corsPlugin;
