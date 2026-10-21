import { expect, test } from 'vitest';
import { buildApp } from '../src/app.ts';

test('GET /api/health returns the API health status', async () => {
  const app = buildApp({ logger: false });

  const response = await app.inject({ method: 'GET', url: '/api/health' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: 'ok' });
});
