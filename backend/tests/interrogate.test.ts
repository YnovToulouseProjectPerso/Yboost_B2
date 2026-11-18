import { describe, it, expect } from 'vitest';

import { DomainError } from '../src/services/domain-error.ts';
import type { GameState } from '../src/services/game.ts';
import { interrogate, type InterrogateAction, type InterrogateDefinition } from '../src/services/interrogate.ts';

// Fictional example definition, never the real scenario: s_x and s_y are in room a, s_z in room b
const definition: InterrogateDefinition = {
  rooms: [
    { id: 'a', suspects: ['s_x', 's_y'] },
    { id: 'b', suspects: ['s_z'] },
    { id: 'c', suspects: [] },
  ],
  suspects: [
    { id: 's_x', name: 'Suspect X', statement: 'Déclaration X.' },
    { id: 's_y', name: 'Suspect Y', statement: 'Déclaration Y.' },
    { id: 's_z', name: 'Suspect Z', statement: 'Déclaration Z.' },
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

function action(suspectId: string, clueId?: string): InterrogateAction {
  return clueId === undefined ? { type: 'interrogate', suspectId } : { type: 'interrogate', suspectId, clueId };
}

// Check that the rule refuses with the given code and leaves the state untouched (INV-02)
function expectRefusal(state: GameState, interrogation: InterrogateAction, code: string): void {
  const before = structuredClone(state);

  try {
    interrogate(definition, state, interrogation, die);
    throw new Error('Expected a DomainError');
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).code).toBe(code);
  }

  expect(state).toEqual(before);
}

describe('interrogate', () => {
  it('gives the base statement of a suspect in the current room', () => {
    const result = interrogate(definition, createState(), action('s_x'), die);

    expect(result.event).toEqual({ type: 'interrogation', result: 'statement', text: 'Déclaration X.' });
  });

  it('gives the statement of the suspect asked, not of another one in the room', () => {
    const result = interrogate(definition, createState(), action('s_y'), die);

    expect(result.event.text).toBe('Déclaration Y.');
  });

  it('remembers that the suspect was interrogated', () => {
    const result = interrogate(definition, createState(), action('s_x'), die);

    expect(result.state.interrogationsDone).toEqual(['s_x']);
  });

  it('gives the same statement again without listing the suspect twice', () => {
    const state = createState({ interrogationsDone: ['s_x'] });

    const result = interrogate(definition, state, action('s_x'), die);

    expect(result.event.text).toBe('Déclaration X.');
    expect(result.state.interrogationsDone).toEqual(['s_x']);
  });

  it('adds nothing to the notebook or the items', () => {
    const result = interrogate(definition, createState(), action('s_x'), die);

    expect(result.state.notebook).toEqual([]);
    expect(result.state.items).toEqual([]);
    expect(result.event).not.toHaveProperty('obtainedClues');
  });

  it('leaves status, time, version and log to the engine', () => {
    const state = createState();

    const result = interrogate(definition, state, action('s_x'), die);

    expect(result.state).toEqual({ ...state, interrogationsDone: ['s_x'] });
  });

  it('never changes the received state', () => {
    const state = createState();
    const before = structuredClone(state);

    interrogate(definition, state, action('s_x'), die);

    expect(state).toEqual(before);
  });

  it('refuses an unknown suspect', () => {
    expectRefusal(createState(), action('s_inconnu'), 'UNKNOWN_SUSPECT');
  });

  it('refuses a suspect who is in another room', () => {
    expectRefusal(createState(), action('s_z'), 'SUSPECT_ABSENT');
  });

  it('refuses any suspect in an empty room', () => {
    expectRefusal(createState({ currentRoom: 'c' }), action('s_x'), 'SUSPECT_ABSENT');
  });

  it('names the absent suspect in the refusal message', () => {
    expect(() => interrogate(definition, createState(), action('s_z'), die)).toThrow('Suspect Z n’est pas dans cette pièce.');
  });

  it('refuses to show a clue until US-07 is done', () => {
    expectRefusal(createState({ notebook: ['i_a'] }), action('s_x', 'i_a'), 'INVALID_REQUEST');
  });
});
