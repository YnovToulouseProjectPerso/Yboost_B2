import cors from '@fastify/cors';

export default async function corsPlugin(app, options) {
  await app.register(cors, {
    origin: options.origin,
  });
}
