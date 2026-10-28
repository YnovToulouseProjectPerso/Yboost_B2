import { DomainError } from './domain-error.ts';
import type { GameState } from './game.ts';

// Parts of the scenario definition needed by the summary
export type SummaryDefinition = {
  suspects: { id: string; name: string }[];
  clues: { id: string; title: string; evidenceAgainst?: string | null }[];
  solution: { culprit: string; motive: string; timeline: { time: string; text: string }[] };
};

export type Summary = {
  culprit: { id: string; name: string };
  motive: string;
  timeline: { time: string; text: string }[];
  possibleEvidence: { id: string; title: string; obtained: boolean }[];
  accusation: { suspectId: string; evidence: string[]; correct: boolean };
};

// Reveal the solution once the game is over. Read only: nothing is modified.
export function buildSummary(definition: SummaryDefinition, state: GameState): Summary {
  if (state.status === 'in_progress' || state.status === 'dawn') {
    throw new DomainError('GAME_IN_PROGRESS', 'Le récapitulatif n’est disponible qu’à la fin de l’enquête.');
  }

  const { culprit, motive, timeline } = definition.solution;
  const suspect = definition.suspects.find(({ id }) => id === culprit);
  // A bug in the scenario, not a player refusal
  if (!suspect) {
    throw new Error(`Unknown culprit "${culprit}" in the scenario.`);
  }

  // Only an accusation ends a game, so a finished game without one is an engine bug
  const { accusation } = state;
  if (!accusation) {
    throw new Error(`Game "${state.gameId}" is over without an accusation.`);
  }

  return {
    culprit: { id: suspect.id, name: suspect.name },
    motive,
    timeline: timeline.map(({ time, text }) => ({ time, text })),
    possibleEvidence: definition.clues
      .filter((clue) => clue.evidenceAgainst === culprit)
      .map(({ id, title }) => ({ id, title, obtained: state.notebook.includes(id) })),
    accusation: { suspectId: accusation.suspectId, evidence: [...accusation.evidence], correct: accusation.correct },
  };
}
