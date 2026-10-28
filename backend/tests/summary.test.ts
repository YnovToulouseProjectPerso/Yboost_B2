import { describe, it, expect } from 'vitest';

import { DomainError } from '../src/services/domain-error.ts';
import type { GameState } from '../src/services/game.ts';
import { buildSummary, type SummaryDefinition } from '../src/services/summary.ts';

// Fictional example definition, never the real scenario
const definition: SummaryDefinition = {
  suspects: [
    { id: 'x', name: 'Xavier' },
    { id: 'y', name: 'Yvonne' },
  ],
  clues: [
    { id: 'i1', title: 'Gant taché', evidenceAgainst: 'x' },
    { id: 'i2', title: 'Lettre déchirée', evidenceAgainst: 'x' },
    { id: 'i3', title: 'Bougie éteinte', evidenceAgainst: null },
  ],
  solution: {
    culprit: 'x',
    motive: 'Une dette de jeu impayée.',
    timeline: [
      { time: '23h00', text: 'Xavier quitte la salle commune.' },
      { time: '0h30', text: 'Un cri traverse l’auberge.' },
    ],
  },
};

// Create a finished game state for testing
function createState(overrides: Partial<GameState> = {}): GameState {
  return {
    gameId: 'g_test',
    seed: 1,
    dieState: 0,
    version: 8,
    status: 'victory',
    remainingActions: 4,
    currentRoom: 'hall',
    unlockedRooms: [],
    items: [],
    notebook: ['i1', 'i2', 'i3'],
    searches: {},
    obtainedRevelations: [],
    interrogationsDone: [],
    accusation: { suspectId: 'x', evidence: ['i1', 'i2'], correct: true },
    log: [{ version: 0, type: 'introduction', result: null, text: 'Intro' }],
    ...overrides,
  };
}

describe('buildSummary', () => {
  it('builds the full summary of a won game', () => {
    const summary = buildSummary(definition, createState());

    expect(summary).toEqual({
      culprit: { id: 'x', name: 'Xavier' },
      motive: 'Une dette de jeu impayée.',
      timeline: [
        { time: '23h00', text: 'Xavier quitte la salle commune.' },
        { time: '0h30', text: 'Un cri traverse l’auberge.' },
      ],
      possibleEvidence: [
        { id: 'i1', title: 'Gant taché', obtained: true },
        { id: 'i2', title: 'Lettre déchirée', obtained: true },
      ],
      accusation: { suspectId: 'x', evidence: ['i1', 'i2'], correct: true },
    });
  });

  it('shows the accused suspect and the real culprit of a game lost on the wrong suspect', () => {
    const state = createState({
      status: 'defeat',
      accusation: { suspectId: 'y', evidence: ['i1', 'i2'], correct: false },
    });

    const summary = buildSummary(definition, state);

    expect(summary.accusation).toEqual({ suspectId: 'y', evidence: ['i1', 'i2'], correct: false });
    expect(summary.culprit).toEqual({ id: 'x', name: 'Xavier' });
  });

  it('lists every piece of evidence against the culprit, obtained only if in the notebook', () => {
    const state = createState({
      status: 'defeat',
      notebook: ['i1', 'i3'],
      accusation: { suspectId: 'x', evidence: ['i1', 'i3'], correct: false },
    });

    const summary = buildSummary(definition, state);

    expect(summary.possibleEvidence).toEqual([
      { id: 'i1', title: 'Gant taché', obtained: true },
      { id: 'i2', title: 'Lettre déchirée', obtained: false },
    ]);
  });

  it.each(['in_progress', 'dawn'] as const)('refuses a game that is not over: %s', (status) => {
    const state = createState({ status, accusation: null });

    try {
      buildSummary(definition, state);
      throw new Error('Expected a DomainError');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe('GAME_IN_PROGRESS');
      expect((error as DomainError).message).toBe('Le récapitulatif n’est disponible qu’à la fin de l’enquête.');
    }
  });

  it('treats a finished game without an accusation as an engine bug, not a refusal', () => {
    const state = createState({ status: 'defeat', accusation: null });

    expect(() => buildSummary(definition, state)).toThrow('over without an accusation');
    expect(() => buildSummary(definition, state)).not.toThrow(DomainError);
  });

  it('modifies neither the definition nor the state', () => {
    const state = createState();
    const definitionBefore = structuredClone(definition);
    const stateBefore = structuredClone(state);

    const summary = buildSummary(definition, state);
    summary.timeline.push({ time: '2h00', text: 'Ajout' });
    summary.accusation.evidence.push('i3');

    expect(definition).toEqual(definitionBefore);
    expect(state).toEqual(stateBefore);
  });
});
