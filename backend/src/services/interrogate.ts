import { DomainError } from './domain-error.ts';
import type { Action, Die, GameEvent, GameState } from './game.ts';

// Parts of the scenario definition needed by the interrogation
export type InterrogateDefinition = {
  rooms: { id: string; suspects: string[] }[];
  suspects: { id: string; name: string; statement: string }[];
};

export type InterrogateAction = Extract<Action, { type: 'interrogate' }>;

// Question a suspect in the current room: they give their base statement (US-06).
// Showing a clue (US-07) is not handled yet. The status and time are handled by the engine.
export function interrogate(
  definition: InterrogateDefinition,
  state: GameState,
  action: InterrogateAction,
  _die: Die,
): { state: GameState; event: GameEvent } {
  const { suspectId, clueId } = action;

  // Every check happens before any change (INV-02)
  if (clueId !== undefined) {
    throw new DomainError('INVALID_REQUEST', 'Présenter un indice n’est pas encore possible.');
  }

  const suspect = definition.suspects.find((candidate) => candidate.id === suspectId);
  if (!suspect) {
    throw new DomainError('UNKNOWN_SUSPECT', 'Ce suspect n’existe pas.');
  }

  const room = definition.rooms.find((candidate) => candidate.id === state.currentRoom);
  if (!room?.suspects.includes(suspectId)) {
    throw new DomainError('SUSPECT_ABSENT', `${suspect.name} n’est pas dans cette pièce.`);
  }

  // Never change the received state
  const newState = structuredClone(state);
  if (!newState.interrogationsDone.includes(suspectId)) {
    newState.interrogationsDone.push(suspectId);
  }

  const event: GameEvent = { type: 'interrogation', result: 'statement', text: suspect.statement };

  return { state: newState, event };
}
