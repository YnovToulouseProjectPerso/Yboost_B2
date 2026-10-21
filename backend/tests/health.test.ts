import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.ts';

test('GET /api/health returns the API health status', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/api/health',
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: 'ok' });
});
