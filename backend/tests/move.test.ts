import { describe, it, expect } from 'vitest';

import { DomainError } from '../src/services/domain-error.ts';
import type { GameState } from '../src/services/game.ts';
import { move, type MoveDefinition } from '../src/services/move.ts';

// Fictional example definition, never the real scenario: a — b — c, c locked by key_c
const definition: MoveDefinition = {
  rooms: [
    { id: 'a', name: 'Pièce A', description: 'Description A.', adjacent: ['b'], requiredKey: null },
    { id: 'b', name: 'Pièce B', description: 'Description B.', adjacent: ['a', 'c'], requiredKey: null },
    { id: 'c', name: 'Pièce C', description: 'Description C.', adjacent: ['b'], requiredKey: 'key_c' },
  ],
};

const die = () => 1;

// Create a game state for testing
function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'g_test',
    seed: 1,
    dieState: 0,
    version: 3,
    status: 'in_progress',
    remainingActions: 5,
    currentRoom: 'a',
    unlockedRooms: [],
    items: [],
    notebook: [],
    searches: {},
    obtainedRevelations: [],
    interrogationsDone: [],
    accusation: null,
    log: [{ version: 0, type: 'introduction', result: null, text: 'Intro' }],
    ...overrides,
  };
}

// Check that the rule refuses with the given code and leaves the state untouched (INV-02)
function expectRefusal(state: GameState, roomId: string, code: string): void {
  const before = structuredClone(state);

  try {
    move(definition, state, { type: 'move', roomId }, die);
    throw new Error('Expected a DomainError');
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).code).toBe(code);
  }

  expect(state).toEqual(before);
}

describe('move', () => {
  it('moves to an adjacent room', () => {
    const state = createState();
    const before = structuredClone(state);

    const result = move(definition, state, { type: 'move', roomId: 'b' }, die);

    expect(result.state.currentRoom).toBe('b');
    expect(result.event).toEqual({ type: 'movement', result: 'success', text: 'Pièce B. Description B.' });
    expect(state).toEqual(before);
  });

  it('leaves status, time, version and log to the engine', () => {
    const state = createState();

    const result = move(definition, state, { type: 'move', roomId: 'b' }, die);

    expect(result.state).toEqual({ ...state, currentRoom: 'b' });
  });

  it('refuses a room that is not adjacent', () => {
    expectRefusal(createState(), 'c', 'ROOM_NOT_ADJACENT');
  });

  it('refuses an unknown room', () => {
    expectRefusal(createState(), 'zzz', 'UNKNOWN_ROOM');
  });

  it('refuses a locked room without its key', () => {
    expectRefusal(createState({ currentRoom: 'b' }), 'c', 'ROOM_LOCKED');
  });

  it('enters a locked room with its key and unlocks it for good (INV-04)', () => {
    const state = createState({ currentRoom: 'b', items: ['key_c'] });
    const before = structuredClone(state);

    const result = move(definition, state, { type: 'move', roomId: 'c' }, die);

    expect(result.state.currentRoom).toBe('c');
    expect(result.state.unlockedRooms).toEqual(['c']);
    expect(result.event.text).toBe('Vous déverrouillez la porte. Pièce C. Description C.');
    expect(state).toEqual(before);
  });

  it('enters an unlocked room again without the key', () => {
    const state = createState({ currentRoom: 'b', unlockedRooms: ['c'], items: [] });

    const result = move(definition, state, { type: 'move', roomId: 'c' }, die);

    expect(result.state.currentRoom).toBe('c');
    expect(result.state.unlockedRooms).toEqual(['c']);
    expect(result.event.text).toBe('Pièce C. Description C.');
  });
});
