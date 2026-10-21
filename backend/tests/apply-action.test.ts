import { afterEach, describe, expect, test } from 'vitest';
import { actionRules } from '../src/services/action-rules.ts';
import { applyAction } from '../src/services/apply-action.ts';
import { DomainError } from '../src/services/domain-error.ts';
import type { Action, GameEvent, GameState } from '../src/services/game.ts';

const movementEvent: GameEvent = {
  type: 'movement',
  result: null,
  text: 'Vous avancez.',
};

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'p_test',
    seed: 42,
    dieState: 0,
    version: 3,
    status: 'in_progress',
    remainingActions: 2,
    currentRoom: 'hall',
    unlockedRooms: [],
    items: [],
    notebook: ['existing-clue'],
    searches: {},
    obtainedRevelations: [],
    interrogationsDone: [],
    accusation: null,
    log: [
      {
        version: 3,
        type: 'introduction',
        result: null,
        text: 'La partie commence.',
      },
    ],
    ...overrides,
  };
}

const move: Action = { type: 'move', roomId: 'office' };
const accuse: Action = { type: 'accuse', suspectId: 'suspect-1', evidence: [] };

afterEach(() => {
  delete actionRules.move;
  delete actionRules.accuse;
});

describe('applyAction', () => {
  test('applies a rule, consumes one action, increments version and logs the event', () => {
    actionRules.move = (state) => {
      state.notebook.push('new-clue');
      return { state, event: movementEvent };
    };
    const state = createState();
    const before = structuredClone(state);

    const result = applyAction(state, move, () => 4);

    expect(result.state).toMatchObject({
      version: 4,
      remainingActions: 1,
      status: 'in_progress',
      notebook: ['existing-clue', 'new-clue'],
    });
    expect(result.state.log.at(-1)).toEqual({
      version: 4,
      type: 'movement',
      result: null,
      text: 'Vous avancez.',
    });
    expect(result.event).toBe(movementEvent);
    expect(state).toEqual(before);
  });

  test('propagates a domain refusal without mutating the input state', () => {
    actionRules.move = (state) => {
      state.notebook.push('temporary-clue');
      throw new DomainError('ROOM_LOCKED', 'La porte est fermée à clé.');
    };
    const state = createState();
    const before = structuredClone(state);

    expect(() => applyAction(state, move, () => 4)).toThrow(
      expect.objectContaining({ code: 'ROOM_LOCKED' }),
    );
    expect(state).toEqual(before);
  });

  test('refuses actions after the game has ended', () => {
    const state = createState({ status: 'victory' });
    const before = structuredClone(state);

    expect(() => applyAction(state, move, () => 4)).toThrow(
      expect.objectContaining({ code: 'GAME_OVER' }),
    );
    expect(state).toEqual(before);
  });

  test('only allows an accusation at dawn', () => {
    const state = createState({ status: 'dawn', remainingActions: 0 });
    const before = structuredClone(state);

    expect(() => applyAction(state, move, () => 4)).toThrow(
      expect.objectContaining({ code: 'DAWN_ACCUSATION_ONLY' }),
    );
    expect(state).toEqual(before);
  });

  test('sets the game status to dawn when the last action is consumed', () => {
    actionRules.move = (state) => ({ state, event: movementEvent });

    const result = applyAction(
      createState({ remainingActions: 1 }),
      move,
      () => 4,
    );

    expect(result.state.remainingActions).toBe(0);
    expect(result.state.status).toBe('dawn');
  });

  test('does not consume an action for an accusation', () => {
    const accusationEvent: GameEvent = {
      type: 'accusation',
      result: 'success',
      text: 'Accusation déposée.',
    };
    actionRules.accuse = (state) => ({
      state: { ...state, status: 'victory' },
      event: accusationEvent,
    });
    const state = createState();

    const result = applyAction(state, accuse, () => 4);

    expect(result.state.remainingActions).toBe(state.remainingActions);
    expect(result.state.version).toBe(state.version + 1);
    expect(result.state.status).toBe('victory');
    expect(result.state.log).toHaveLength(state.log.length + 1);
  });
});
