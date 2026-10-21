import { expect, test } from 'vitest';
import { buildApp } from '../src/app.ts';

test('the OpenAPI specification lists the game routes with shared schemas', async () => {
  const app = buildApp({ logger: false });

  const { paths, components } = (await app.inject({ method: 'GET', url: '/documentation/json' })).json();

  expect(Object.keys(paths)).toEqual(expect.arrayContaining(['/api/games', '/api/games/{gameId}']));
  expect(Object.keys(paths['/api/games'].post.responses)).toEqual(['201', '400']);
  expect(Object.keys(paths['/api/games/{gameId}'].get.responses)).toEqual(['200', '404']);
  expect(Object.keys(components.schemas)).toEqual(expect.arrayContaining(['Game', 'Event', 'ActionResult', 'Error']));
});

test('Swagger UI is served on /documentation', async () => {
  const app = buildApp({ logger: false });

  const response = await app.inject({ method: 'GET', url: '/documentation/' });

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toContain('text/html');
});
