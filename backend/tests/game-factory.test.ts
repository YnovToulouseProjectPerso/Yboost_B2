import { describe, expect, test } from 'vitest';
import { buildView, createState, type GameDefinition } from '../src/services/game-factory.ts';
import type { GameState } from '../src/services/game.ts';

const definition = {
  rules: { initialActions: 12, startRoom: 'hall', startTime: '1h00' },
  introduction: '1h00. Un cri traverse l’auberge…',
  rooms: [
    {
      id: 'hall',
      name: 'Salle commune',
      description: 'Le feu crépite dans la cheminée.',
      adjacent: ['office'],
      requiredKey: null,
      suspects: ['suspect-a'],
    },
    {
      id: 'office',
      name: 'Bureau',
      description: 'Le bureau est fermé.',
      adjacent: ['hall'],
      requiredKey: 'key-office',
      suspects: [],
    },
  ],
  suspects: [
    { id: 'suspect-a', name: 'Alex', role: 'Voyageur' },
    { id: 'suspect-b', name: 'Sam', role: 'Aubergiste' },
  ],
  clues: [
    {
      id: 'clue-a',
      title: 'Une empreinte',
      text: 'Une empreinte est visible près de la porte.',
      source: 'search' as const,
      location: 'hall',
      evidenceAgainst: 'suspect-b',
    },
    {
      id: 'clue-b',
      title: 'Un témoignage',
      text: 'Alex a entendu un bruit.',
      source: 'interrogation' as const,
      location: 'hall',
      evidenceAgainst: null,
    },
  ],
  items: [{ id: 'key-office', name: 'Clé du bureau' }],
  solution: { culprit: 'suspect-b', interrogationCombinations: [['clue-a', 'clue-b']] },
} satisfies GameDefinition & {
  solution: { culprit: string; interrogationCombinations: string[][] };
};

function stateWith(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createState(definition, 123),
    ...overrides,
  };
}

function collectKeys(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectKeys);
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => [key, ...collectKeys(child)]);
  }
  return [];
}

describe('game state and player view', () => {
  test('creates a fresh initial state and renders its introduction', () => {
    const state = createState(definition, 123);
    const view = buildView(definition, state);

    expect(state).toMatchObject({
      seed: 123,
      dieState: 0,
      version: 0,
      status: 'in_progress',
      remainingActions: 12,
      currentRoom: 'hall',
    });
    expect(view).toMatchObject({
      version: 0,
      remainingActions: 12,
      time: '1h00',
      currentRoom: { id: 'hall', fullySearched: false },
      lastEvent: { type: 'introduction', text: definition.introduction },
    });
    expect(view.suspects).toEqual([
      { id: 'suspect-a', name: 'Alex', role: 'Voyageur' },
      { id: 'suspect-b', name: 'Sam', role: 'Aubergiste' },
    ]);
    expect(view.log).toEqual([
      { version: 0, type: 'introduction', result: null, text: definition.introduction },
    ]);
    expect(state.gameId).not.toBe(createState(definition, 123).gameId);
  });

  test.each([
    [9, '2h30'],
    [0, '7h00'],
  ])('derives the time for %i remaining actions', (remainingActions, time) => {
    expect(buildView(definition, stateWith({ remainingActions })).time).toBe(time);
  });

  test('marks locked adjacent rooms and unlocks them only when state says so', () => {
    const locked = buildView(definition, stateWith());
    const unlocked = buildView(definition, stateWith({ unlockedRooms: ['office'] }));

    expect(locked.adjacentRooms).toEqual([{ id: 'office', name: 'Bureau', locked: true }]);
    expect(unlocked.adjacentRooms[0]?.locked).toBe(false);
  });

  test('returns only the player-safe fields without evidence or interrogation secrets', () => {
    const view = buildView(definition, stateWith({
      notebook: ['clue-a', 'clue-b'],
      items: ['key-office'],
      searches: { hall: { found: 1, previousFailure: false } },
      interrogationsDone: ['secret-interrogation-combination'],
    }));

    expect(view.notebook).toEqual([
      {
        id: 'clue-a',
        title: 'Une empreinte',
        text: 'Une empreinte est visible près de la porte.',
        source: 'search',
        location: 'hall',
      },
      {
        id: 'clue-b',
        title: 'Un témoignage',
        text: 'Alex a entendu un bruit.',
        source: 'interrogation',
        location: 'hall',
      },
    ]);
    expect(view.items).toEqual([{ id: 'key-office', name: 'Clé du bureau' }]);
    expect(view.presentSuspects).toEqual([{ id: 'suspect-a', name: 'Alex', role: 'Voyageur' }]);
    expect(view.currentRoom.fullySearched).toBe(true);
    expect(collectKeys(view)).not.toContain('evidenceAgainst');
    expect(collectKeys(view)).not.toContain('culprit');
    expect(collectKeys(view)).not.toContain('interrogationsDone');
    expect(JSON.stringify(view)).not.toContain('secret-interrogation-combination');
  });

  test('keeps separate game states independent and returns detached view data', () => {
    const first = createState(definition, 10);
    const second = createState(definition, 11);
    first.notebook.push('clue-a');
    first.log[0]!.text = 'Changed locally';
    const firstView = buildView(definition, first);
    const secondView = buildView(definition, second);

    firstView.log[0]!.text = 'Changed view';
    expect(second.notebook).toEqual([]);
    expect(second.log[0]?.text).toBe(definition.introduction);
    expect(secondView.log[0]?.text).toBe(definition.introduction);
  });

  test('does not mutate the definition while creating state or building a view', () => {
    const before = structuredClone(definition);

    const state = createState(definition, 123);
    buildView(definition, state);

    expect(definition).toEqual(before);
  });

  test('rejects invalid state references rather than returning an incomplete view', () => {
    expect(() => buildView(definition, stateWith({ currentRoom: 'missing' }))).toThrow(RangeError);
    expect(() => buildView(definition, stateWith({ notebook: ['missing'] }))).toThrow(RangeError);
    expect(() => createState(definition, 0)).toThrow(RangeError);
  });
});
