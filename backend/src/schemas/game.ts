const string = { type: 'string' } as const;
const strings = { type: 'array', items: string } as const;
const integer = { type: 'integer' } as const;

const suspect = {
  type: 'object',
  required: ['id', 'name', 'role'],
  properties: { id: string, name: string, role: string },
} as const;

const eventType = {
  type: 'string',
  enum: ['introduction', 'movement', 'search', 'interrogation', 'accusation', 'dawn'],
} as const;

const result = { type: ['string', 'null'] } as const;

export const eventSchema = {
  type: 'object',
  required: ['type', 'result', 'text'],
  properties: { type: eventType, result, text: string, obtainedClues: strings, obtainedItems: strings },
} as const;

export const gameSchema = {
  type: 'object',
  required: [
    'gameId',
    'seed',
    'version',
    'status',
    'remainingActions',
    'time',
    'currentRoom',
    'adjacentRooms',
    'presentSuspects',
    'notebook',
    'items',
    'lastEvent',
    'suspects',
    'log',
  ],
  properties: {
    gameId: string,
    seed: integer,
    version: integer,
    status: { type: 'string', enum: ['in_progress', 'dawn', 'victory', 'defeat'] },
    remainingActions: integer,
    time: string,
    currentRoom: {
      type: 'object',
      required: ['id', 'name', 'description', 'fullySearched'],
      properties: { id: string, name: string, description: string, fullySearched: { type: 'boolean' } },
    },
    adjacentRooms: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'locked'],
        properties: { id: string, name: string, locked: { type: 'boolean' } },
      },
    },
    presentSuspects: { type: 'array', items: suspect },
    notebook: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'text', 'source', 'location'],
        properties: {
          id: string,
          title: string,
          text: string,
          source: { type: 'string', enum: ['search', 'interrogation'] },
          location: string,
        },
      },
    },
    items: {
      type: 'array',
      items: { type: 'object', required: ['id', 'name'], properties: { id: string, name: string } },
    },
    lastEvent: eventSchema,
    suspects: { type: 'array', items: suspect },
    log: {
      type: 'array',
      items: {
        type: 'object',
        required: ['version', 'type', 'result', 'text'],
        properties: { version: integer, type: eventType, result, text: string },
      },
    },
  },
} as const;

export function actionBody(properties: Record<string, object> = {}, required: string[] = []) {
  return {
    type: 'object',
    required: ['version', ...required],
    properties: { version: { type: 'integer', minimum: 0 }, ...properties },
  } as const;
}

export const actionResponse = {
  type: 'object',
  required: ['event', 'game'],
  properties: { event: eventSchema, game: gameSchema },
} as const;
