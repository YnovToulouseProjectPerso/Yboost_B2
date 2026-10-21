import { describe, expect, it } from 'vitest';
import { advanceTime, checkStatus } from '../src/services/game-status.ts';
import type { Action, GameEvent, GameState } from '../src/services/game.ts';

function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'p_test',
    seed: 42,
    dieState: 0,
    version: 0,
    status: 'in_progress',
    remainingActions: 12,
    currentRoom: 'a',
    unlockedRooms: [],
    items: [],
    notebook: [],
    searches: {},
    obtainedRevelations: [],
    interrogationsDone: [],
    accusation: null,
    log: [],
    ...overrides,
  };
}

function createEvent(text: string): GameEvent {
  return { type: 'movement', result: null, text };
}

const actions: Action['type'][] = ['move', 'search', 'interrogate', 'accuse'];

describe('checkStatus', () => {
  it('allows all actions during the game', () => {
    const state = createState();

    for (const action of actions) {
      expect(() => checkStatus(state, action)).not.toThrow();
    }
  });

  it('allows accusation at dawn', () => {
    const state = createState({ status: 'dawn', remainingActions: 0 });

    expect(() => checkStatus(state, 'accuse')).not.toThrow();
  });

  it('blocks other actions at dawn', () => {
    const state = createState({ status: 'dawn', remainingActions: 0 });

    for (const action of actions.filter((a) => a !== 'accuse')) {
      expect(() => checkStatus(state, action)).toThrow(
        expect.objectContaining({
          code: 'DAWN_ACCUSATION_ONLY',
          message: "L'aube est levée : il ne vous reste qu'à accuser.",
        }),
      );
    }
  });

  it.each(['victory', 'defeat'] as const)('blocks all actions after %s', (status) => {
    const state = createState({ status });

    for (const action of actions) {
      expect(() => checkStatus(state, action)).toThrow(
        expect.objectContaining({ code: 'GAME_OVER', message: "L'enquête est terminée." }),
      );
    }
  });

  it('does not change the original state', () => {
    const state = createState();
    const original = structuredClone(state);

    checkStatus(state, 'move');

    expect(state).toEqual(original);
  });
});

describe('advanceTime', () => {
  it('removes one action and keeps the event text', () => {
    const result = advanceTime(createState(), createEvent('Vous avancez.'));

    expect(result.state.remainingActions).toBe(11);
    expect(result.state.status).toBe('in_progress');
    expect(result.event.text).toBe('Vous avancez.');
  });

  it('starts dawn after the last action', () => {
    const result = advanceTime(createState({ remainingActions: 1 }), createEvent('Vous fouillez.'));

    expect(result.state.remainingActions).toBe(0);
    expect(result.state.status).toBe('dawn');
    expect(result.event.text).toBe("Vous fouillez. L'aube pointe : il ne vous reste plus qu'à accuser.");
  });

  it('does not start dawn if an accusation exists', () => {
    const state = createState({
      remainingActions: 1,
      accusation: { suspectId: 's1', evidence: ['i_a1', 'i_a2'], correct: false },
    });

    const result = advanceTime(state, createEvent('Action terminée.'));

    expect(result.state.remainingActions).toBe(0);
    expect(result.state.status).toBe('in_progress');
  });

  it('throws an error when no actions remain', () => {
    const state = createState({ remainingActions: 0 });

    expect(() => advanceTime(state, createEvent('Vous avancez.'))).toThrow('INV-01');
  });

  it('does not change the original objects', () => {
    const state = createState();
    const event = createEvent('Vous avancez.');
    const originalState = structuredClone(state);
    const originalEvent = structuredClone(event);

    const result = advanceTime(state, event);

    expect(state).toEqual(originalState);
    expect(event).toEqual(originalEvent);
    expect(result.state).not.toBe(state);
    expect(result.event).not.toBe(event);
  });
});
