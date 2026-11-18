import { describe, it, expect } from 'vitest';

import { DomainError } from '../src/services/domain-error.ts';
import type { GameState } from '../src/services/game.ts';
import {
  interrogate,
  interrogationKey,
  type InterrogateAction,
  type InterrogateDefinition,
} from '../src/services/interrogate.ts';

// Fictional example definition (format of docs/05, never the real scenario):
// s1 and s3 are in room a, s2 in room b. s1 gives a base statement, s2 one with an item, s3 has none.
const definition: InterrogateDefinition = {
  rooms: [
    { id: 'a', suspects: ['s1', 's3'] },
    { id: 'b', suspects: ['s2'] },
    { id: 'c', suspects: [] },
  ],
  suspects: [
    { id: 's1', name: 'Suspect Un' },
    { id: 's2', name: 'Suspect Deux' },
    { id: 's3', name: 'Suspect Trois' },
  ],
  clues: [
    { id: 'i_a1', text: 'Indice A1.', source: 'search', givenItem: null },
    { id: 't_s1_base', text: 'Déclaration de S1.', source: 'interrogation', givenItem: null },
    { id: 't_s2_base', text: 'Déclaration de S2.', source: 'interrogation', givenItem: 'key_c' },
  ],
  interrogations: [
    { suspectId: 's1', presentedClue: null, reveals: 't_s1_base' },
    { suspectId: 's2', presentedClue: null, reveals: 't_s2_base' },
    { suspectId: 's2', presentedClue: 'i_a1', reveals: 't_s2_base' },
  ],
};

const die = () => 1;

// Game state built by hand in the format of docs/05
function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'g_test',
    seed: 1,
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
    log: [{ version: 0, type: 'introduction', result: null, text: 'Intro' }],
    ...overrides,
  };
}

function action(suspectId: string, clueId?: string): InterrogateAction {
  return clueId === undefined ? { type: 'interrogate', suspectId } : { type: 'interrogate', suspectId, clueId };
}

// Check that the rule refuses with the given code and leaves the state untouched (INV-02)
function expectRefusal(
  state: GameState,
  interrogation: InterrogateAction,
  code: string,
  scenario: InterrogateDefinition = definition,
): void {
  const before = structuredClone(state);

  try {
    interrogate(scenario, state, interrogation, die);
    throw new Error('Expected a DomainError');
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).code).toBe(code);
  }

  expect(state).toEqual(before);
}

describe('interrogate without a clue (#38)', () => {
  it('reveals the base statement of a present suspect and adds it to the notebook', () => {
    const result = interrogate(definition, createState(), action('s1'), die);

    expect(result.event).toEqual({
      type: 'interrogation',
      result: 'revelation',
      text: 'Déclaration de S1.',
      obtainedClues: ['t_s1_base'],
      obtainedItems: [],
    });
    expect(result.state.notebook).toEqual(['t_s1_base']);
    expect(result.state.obtainedRevelations).toEqual(['t_s1_base']);
  });

  it('records the "suspect:" key without a clue', () => {
    const result = interrogate(definition, createState(), action('s1'), die);

    expect(interrogationKey('s1')).toBe('s1:');
    expect(result.state.interrogationsDone).toEqual(['s1:']);
  });

  it('keeps the clues already in the notebook, in order', () => {
    const result = interrogate(definition, createState({ notebook: ['i_a1'] }), action('s1'), die);

    expect(result.state.notebook).toEqual(['i_a1', 't_s1_base']);
  });

  it('gives the item of the testimony', () => {
    const result = interrogate(definition, createState({ currentRoom: 'b' }), action('s2'), die);

    expect(result.state.items).toEqual(['key_c']);
    expect(result.event.obtainedItems).toEqual(['key_c']);
  });

  it('never duplicates an item already owned', () => {
    const result = interrogate(definition, createState({ currentRoom: 'b', items: ['key_c'] }), action('s2'), die);

    expect(result.state.items).toEqual(['key_c']);
    expect(result.event.obtainedItems).toEqual([]);
  });

  it('ends with no effect when no base statement is planned, without changing the state', () => {
    const state = createState();

    const result = interrogate(definition, state, action('s3'), die);

    expect(result.event).toEqual({ type: 'interrogation', result: 'no_effect', text: 'Je n’ai rien à vous dire.' });
    expect(result.state).toEqual(state);
  });

  it('leaves status, actions, version and log to the engine', () => {
    const state = createState();

    const result = interrogate(definition, state, action('s1'), die);

    expect(result.state).toEqual({
      ...state,
      notebook: ['t_s1_base'],
      obtainedRevelations: ['t_s1_base'],
      interrogationsDone: ['s1:'],
    });
  });

  it('never changes the received state', () => {
    const state = createState();
    const before = structuredClone(state);

    interrogate(definition, state, action('s1'), die);

    expect(state).toEqual(before);
  });
});

describe('interrogate refusals (#38)', () => {
  it('refuses ALREADY_OBTAINED the second time', () => {
    const first = interrogate(definition, createState(), action('s1'), die);

    expectRefusal(first.state, action('s1'), 'ALREADY_OBTAINED');
  });

  it('refuses ALREADY_OBTAINED when the testimony is already in the notebook (INV-05)', () => {
    expectRefusal(createState({ notebook: ['t_s1_base'] }), action('s1'), 'ALREADY_OBTAINED');
  });

  it('refuses a suspect from another room', () => {
    expectRefusal(createState(), action('s2'), 'SUSPECT_ABSENT');
  });

  it('refuses any suspect in a room without suspects', () => {
    expectRefusal(createState({ currentRoom: 'c' }), action('s1'), 'SUSPECT_ABSENT');
  });

  it('names the absent suspect in the message', () => {
    expect(() => interrogate(definition, createState(), action('s2'), die)).toThrow('Suspect Deux n’est pas dans cette pièce.');
  });

  it('refuses an unknown suspect', () => {
    expectRefusal(createState(), action('s_unknown'), 'UNKNOWN_SUSPECT');
  });

  it('checks the suspect before the room', () => {
    expectRefusal(createState({ currentRoom: 'b' }), action('s_unknown'), 'UNKNOWN_SUSPECT');
  });
});

describe('interrogate with a broken scenario', () => {
  it('fails loudly, not as a player refusal, when a statement reveals a search clue', () => {
    const broken: InterrogateDefinition = {
      ...definition,
      interrogations: [{ suspectId: 's1', presentedClue: null, reveals: 'i_a1' }],
    };

    expect(() => interrogate(broken, createState(), action('s1'), die)).toThrow(/source « interrogation »/);
  });
});

// Fictional combinations of #40 (never the real scenario): s1 and s2 are in room a.
// s1 + i1 -> t_a ; s1 + i2 -> t_b (gives key_c) ; s2 + i1 -> t_c ; s2 + i3 -> t_c
const clueDefinition: InterrogateDefinition = {
  rooms: [
    { id: 'a', suspects: ['s1', 's2'] },
    { id: 'b', suspects: [] },
  ],
  suspects: [
    { id: 's1', name: 'Suspect Un' },
    { id: 's2', name: 'Suspect Deux' },
  ],
  clues: [
    { id: 'i1', text: 'Indice 1.', source: 'search', givenItem: null },
    { id: 'i2', text: 'Indice 2.', source: 'search', givenItem: null },
    { id: 'i3', text: 'Indice 3.', source: 'search', givenItem: null },
    { id: 't_a', text: 'Révélation A.', source: 'interrogation', givenItem: null },
    { id: 't_b', text: 'Révélation B.', source: 'interrogation', givenItem: 'key_c' },
    { id: 't_c', text: 'Révélation C.', source: 'interrogation', givenItem: null },
  ],
  interrogations: [
    { suspectId: 's1', presentedClue: 'i1', reveals: 't_a' },
    { suspectId: 's1', presentedClue: 'i2', reveals: 't_b' },
    { suspectId: 's2', presentedClue: 'i1', reveals: 't_c' },
    { suspectId: 's2', presentedClue: 'i3', reveals: 't_c' },
  ],
};

function showClue(state: GameState, suspectId: string, clueId: string) {
  return interrogate(clueDefinition, state, action(suspectId, clueId), die);
}

describe('interrogate with a clue (#40)', () => {
  it('reveals the planned testimony and adds it to the notebook', () => {
    const result = showClue(createState({ notebook: ['i1'] }), 's1', 'i1');

    expect(result.event).toEqual({
      type: 'interrogation',
      result: 'revelation',
      text: 'Révélation A.',
      obtainedClues: ['t_a'],
      obtainedItems: [],
    });
    expect(result.state.notebook).toEqual(['i1', 't_a']);
    expect(result.state.obtainedRevelations).toEqual(['t_a']);
    expect(result.state.interrogationsDone).toEqual(['s1:i1']);
  });

  it('uses the combination of the suspect asked: the same clue reveals something else to another suspect', () => {
    const result = showClue(createState({ notebook: ['i1'] }), 's2', 'i1');

    expect(result.event.obtainedClues).toEqual(['t_c']);
  });

  it('gives the item of the revealed testimony', () => {
    const result = showClue(createState({ notebook: ['i2'] }), 's1', 'i2');

    expect(result.state.items).toEqual(['key_c']);
    expect(result.event.obtainedItems).toEqual(['key_c']);
  });

  it('never duplicates an item already owned, for instance a key found by searching', () => {
    const result = showClue(createState({ notebook: ['i2'], items: ['key_c'] }), 's1', 'i2');

    expect(result.state.items).toEqual(['key_c']);
    expect(result.event.obtainedItems).toEqual([]);
  });

  it('ends with no effect for a combination that is not planned, the notebook unchanged', () => {
    const state = createState({ notebook: ['i3'] });

    const result = showClue(state, 's1', 'i3');

    expect(result.event).toEqual({ type: 'interrogation', result: 'no_effect', text: 'Je ne vois pas le rapport.' });
    expect(result.state).toEqual({ ...state, interrogationsDone: ['s1:i3'] });
  });

  it('can ask a combination with no effect again: still no effect, recorded once', () => {
    const first = showClue(createState({ notebook: ['i3'] }), 's1', 'i3');

    const second = showClue(first.state, 's1', 'i3');

    expect(second.event.result).toBe('no_effect');
    expect(second.state.interrogationsDone).toEqual(['s1:i3']);
  });

  it('keeps the notebook free of duplicates (INV-05)', () => {
    const first = showClue(createState({ notebook: ['i1', 'i2'] }), 's1', 'i1');
    const second = showClue(first.state, 's1', 'i2');

    expect(second.state.notebook).toEqual(['i1', 'i2', 't_a', 't_b']);
    expect(new Set(second.state.notebook).size).toBe(second.state.notebook.length);
  });

  it('never changes the received state', () => {
    const state = createState({ notebook: ['i2'] });
    const before = structuredClone(state);

    showClue(state, 's1', 'i2');

    expect(state).toEqual(before);
  });
});

describe('interrogate with a clue: refusals (#40)', () => {
  it('refuses a clue that is not in the notebook', () => {
    expectRefusal(createState({ notebook: ['i2'] }), action('s1', 'i1'), 'CLUE_NOT_OWNED', clueDefinition);
  });

  it('refuses a combination asked again', () => {
    const first = showClue(createState({ notebook: ['i1'] }), 's1', 'i1');

    expectRefusal(first.state, action('s1', 'i1'), 'ALREADY_OBTAINED', clueDefinition);
  });

  it('refuses a revelation already obtained with another clue (s2 + i3 after s2 + i1)', () => {
    const first = showClue(createState({ notebook: ['i1', 'i3'] }), 's2', 'i1');

    expectRefusal(first.state, action('s2', 'i3'), 'ALREADY_OBTAINED', clueDefinition);
  });

  it('checks the suspect before the clue: unknown, then absent, then not owned', () => {
    expectRefusal(createState(), action('s_unknown', 'i_unknown'), 'UNKNOWN_SUSPECT', clueDefinition);
    expectRefusal(createState({ currentRoom: 'b' }), action('s1', 'i_unknown'), 'SUSPECT_ABSENT', clueDefinition);
  });

  it('checks the clue before the revelation: an unowned clue is refused even if its revelation is known', () => {
    expectRefusal(createState({ obtainedRevelations: ['t_a'], notebook: ['t_a'] }), action('s1', 'i1'), 'CLUE_NOT_OWNED', clueDefinition);
  });
});
