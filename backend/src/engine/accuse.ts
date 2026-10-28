import { DomainError } from '../services/domain-error.ts';
import type { Action, Die, GameEvent, GameState } from '../services/game.ts';

// Parts of the scenario definition needed by the accusation
export type AccuseDefinition = {
  suspects: { id: string }[];
  clues: { id: string; evidenceAgainst?: string | null }[];
  solution: { culprit: string };
};

export type AccuseAction = Extract<Action, { type: 'accuse' }>;

// Close the investigation: victory or defeat. The status check is done by the engine.
export function accuse(
  definition: AccuseDefinition,
  state: GameState,
  action: AccuseAction,
  _die: Die,
): { state: GameState; event: GameEvent } {
  const { suspectId, evidence } = action;

  // Exactly 2 different clues (already blocked by the route schema, checked again here)
  if (
    !Array.isArray(evidence) ||
    evidence.length !== 2 ||
    evidence.some((id) => typeof id !== 'string') ||
    evidence[0] === evidence[1]
  ) {
    throw new DomainError('INVALID_REQUEST', 'Une accusation doit s’appuyer sur exactement 2 indices différents.');
  }

  if (!definition.suspects.some((suspect) => suspect.id === suspectId)) {
    throw new DomainError('UNKNOWN_SUSPECT', 'Ce suspect n’existe pas.');
  }

  if (evidence.some((id) => !state.notebook.includes(id))) {
    throw new DomainError('CLUE_NOT_OWNED', 'Vous ne possédez pas cet indice dans votre carnet.');
  }

  // Correct only if the culprit is named and both clues point at them
  const culprit = definition.solution.culprit;
  const correct =
    suspectId === culprit &&
    evidence.every((id) => definition.clues.find((clue) => clue.id === id)?.evidenceAgainst === culprit);

  // Never change the received state
  const newState = structuredClone(state);
  newState.accusation = { suspectId, evidence: [...evidence], correct };
  newState.status = correct ? 'victory' : 'defeat';

  // The text never says which clue was or was not evidence
  const event: GameEvent = correct
    ? { type: 'accusation', result: 'victory', text: 'Vos preuves sont accablantes : le coupable est démasqué. L’enquête est résolue.' }
    : { type: 'accusation', result: 'defeat', text: 'Votre accusation ne tient pas. Le véritable coupable s’échappe dans la nuit.' };

  return { state: newState, event };
}
