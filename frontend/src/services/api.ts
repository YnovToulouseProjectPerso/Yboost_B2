import type { ActionResult, Game, Summary } from './game.ts';

export type ApiErrorType = 'network' | 'rejection' | 'unexpected';

type Rejection = { status: number; code: string; game?: Game };

export const NETWORK_MESSAGE = 'Impossible de joindre le serveur. Vérifiez qu’il est lancé.';
export const UNEXPECTED_MESSAGE = 'Réponse inattendue du serveur';

export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  code?: string;
  game?: Game;

  constructor(type: ApiErrorType, message: string, rejection?: Rejection) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = rejection?.status;
    this.code = rejection?.code;
    this.game = rejection?.game;
  }
}

type JsonObject = { [key: string]: unknown };

const isRecord = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isGame = (value: unknown): value is Game =>
  isRecord(value) && typeof value.gameId === 'string' && typeof value.version === 'number';

const isActionResult = (value: unknown): value is ActionResult =>
  isRecord(value) && isRecord(value.event) && isGame(value.game);

const isSummary = (value: unknown): value is Summary => isRecord(value) && isRecord(value.culprit);

const isErrorBody = (value: unknown): value is { error: { code: string; message: string }; game?: unknown } =>
  isRecord(value) &&
  isRecord(value.error) &&
  typeof value.error.code === 'string' &&
  typeof value.error.message === 'string';

function unexpected(detail: unknown) {
  console.error(UNEXPECTED_MESSAGE, detail);
  return new ApiError('unexpected', UNEXPECTED_MESSAGE);
}

export async function request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('network', NETWORK_MESSAGE);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    if (response.status >= 500) throw new ApiError('network', NETWORK_MESSAGE);
    throw unexpected(error);
  }

  if (response.ok) {
    if (isErrorBody(data)) throw unexpected(data);
    return data;
  }

  if (!isErrorBody(data)) throw unexpected(data);
  throw new ApiError('rejection', data.error.message, {
    status: response.status,
    code: data.error.code,
    game: isGame(data.game) ? data.game : undefined,
  });
}

async function expectShape<T>(response: Promise<unknown>, isValid: (data: unknown) => data is T): Promise<T> {
  const data = await response;
  if (!isValid(data)) throw unexpected(data);
  return data;
}

const gamePath = (gameId: string, route = '') => `/games/${encodeURIComponent(gameId)}${route}`;

export const createGame = (seed?: number) => expectShape(request('POST', '/games', { seed }), isGame);

export const getGame = (gameId: string) => expectShape(request('GET', gamePath(gameId)), isGame);

export const move = (gameId: string, version: number, roomId: string) =>
  expectShape(request('POST', gamePath(gameId, '/move'), { version, roomId }), isActionResult);

export const search = (gameId: string, version: number) =>
  expectShape(request('POST', gamePath(gameId, '/search'), { version }), isActionResult);

export const interrogate = (gameId: string, version: number, suspectId: string, clueId?: string) =>
  expectShape(request('POST', gamePath(gameId, '/interrogate'), { version, suspectId, clueId }), isActionResult);

export const accuse = (gameId: string, version: number, suspectId: string, evidence: string[]) =>
  expectShape(request('POST', gamePath(gameId, '/accuse'), { version, suspectId, evidence }), isActionResult);

export const getSummary = (gameId: string) => expectShape(request('GET', gamePath(gameId, '/summary')), isSummary);
