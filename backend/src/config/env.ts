import 'dotenv/config';

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

export const config = {
  host: process.env.HOST || '127.0.0.1',
  port: parsePort(process.env.PORT),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};
