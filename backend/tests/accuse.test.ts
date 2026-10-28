import { describe, it, expect } from 'vitest';

import { accuse, type AccuseDefinition } from '../src/services/accuse.ts';
import { DomainError } from '../src/services/domain-error.ts';
import type { GameState } from '../src/services/game.ts';

// Fictional example definition, never the real scenario
const definition: AccuseDefinition = {
  suspects: [{ id: 'x' }, { id: 'y' }],
  clues: [
    { id: 'i1', evidenceAgainst: 'x' },
    { id: 'i2', evidenceAgainst: 'x' },
    { id: 'i3', evidenceAgainst: null },
  ],
  solution: { culprit: 'x' },
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
    currentRoom: 'hall',
    unlockedRooms: [],
    items: [],
    notebook: ['i1', 'i2', 'i3'],
    searches: {},
    obtainedRevelations: [],
    interrogationsDone: [],
    accusation: null,
    log: [{ version: 0, type: 'introduction', result: null, text: 'Intro' }],
    ...overrides,
  };
}

// Check that the rule refuses with the given code and leaves the state untouched
function expectRefusal(state: GameState, suspectId: string, evidence: string[], code: string): void {
  const before = structuredClone(state);

  try {
    accuse(definition, state, { type: 'accuse', suspectId, evidence }, die);
    throw new Error('Expected a DomainError');
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    expect((error as DomainError).code).toBe(code);
  }

  expect(state).toEqual(before);
}

describe('accuse', () => {
  it('wins with the culprit and 2 pieces of evidence against them (INV-11)', () => {
    const state = createState();
    const before = structuredClone(state);

    const result = accuse(definition, state, { type: 'accuse', suspectId: 'x', evidence: ['i1', 'i2'] }, die);

    expect(result.state.status).toBe('victory');
    expect(result.state.accusation).toEqual({ suspectId: 'x', evidence: ['i1', 'i2'], correct: true });
    expect(result.event.type).toBe('accusation');
    expect(result.event.result).toBe('victory');
    expect(state).toEqual(before);
  });

  it('loses with the culprit, 1 piece of evidence and 1 neutral clue', () => {
    const result = accuse(definition, createState(), { type: 'accuse', suspectId: 'x', evidence: ['i1', 'i3'] }, die);

    expect(result.state.status).toBe('defeat');
    expect(result.state.accusation?.correct).toBe(false);
    expect(result.event.result).toBe('defeat');
  });

  it('loses with the wrong suspect and 2 real pieces of evidence against the culprit', () => {
    const result = accuse(definition, createState(), { type: 'accuse', suspectId: 'y', evidence: ['i1', 'i2'] }, die);

    expect(result.state.status).toBe('defeat');
    expect(result.state.accusation).toEqual({ suspectId: 'y', evidence: ['i1', 'i2'], correct: false });
  });

  it('refuses a clue that is not in the notebook (INV-02, INV-10)', () => {
    const state = createState({ notebook: ['i1'] });

    expectRefusal(state, 'x', ['i1', 'i2'], 'CLUE_NOT_OWNED');
    expect(state.status).toBe('in_progress');
  });

  it('refuses an unknown suspect', () => {
    expectRefusal(createState(), 'z', ['i1', 'i2'], 'UNKNOWN_SUSPECT');
  });

  it('refuses 1 clue, 3 clues or the same clue twice', () => {
    expectRefusal(createState(), 'x', ['i1'], 'INVALID_REQUEST');
    expectRefusal(createState(), 'x', ['i1', 'i2', 'i3'], 'INVALID_REQUEST');
    expectRefusal(createState(), 'x', ['i1', 'i1'], 'INVALID_REQUEST');
  });

  it('accepts an accusation at dawn', () => {
    const won = accuse(definition, createState({ status: 'dawn', remainingActions: 0 }), { type: 'accuse', suspectId: 'x', evidence: ['i1', 'i2'] }, die);
    const lost = accuse(definition, createState({ status: 'dawn', remainingActions: 0 }), { type: 'accuse', suspectId: 'y', evidence: ['i1', 'i2'] }, die);

    expect(won.state.status).toBe('victory');
    expect(lost.state.status).toBe('defeat');
  });

  it('keeps remainingActions, version and log unchanged', () => {
    const state = createState();

    const result = accuse(definition, state, { type: 'accuse', suspectId: 'x', evidence: ['i1', 'i2'] }, die);

    expect(result.state.remainingActions).toBe(state.remainingActions);
    expect(result.state.version).toBe(state.version);
    expect(result.state.log).toEqual(state.log);
  });
});
