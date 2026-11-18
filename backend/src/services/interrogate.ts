import { DomainError } from './domain-error.ts';
import type { Action, Die, GameEvent, GameState } from './game.ts';

// Parts of the scenario definition needed by the interrogation (docs/05)
export type InterrogateDefinition = {
  // Presence is read from rooms[].suspects, like the player view (buildView), so both always agree
  rooms: { id: string; suspects: string[] }[];
  suspects: { id: string; name: string }[];
  // Testimonies are clues whose source is "interrogation"
  clues: { id: string; text: string; source: 'search' | 'interrogation'; givenItem?: string | null }[];
  // presentedClue null = base statement (US-06, #38); a clue id = showing a clue (US-07, #40)
  interrogations: { suspectId: string; presentedClue: string | null; reveals: string }[];
};

export type InterrogateAction = Extract<Action, { type: 'interrogate' }>;

type Suspect = InterrogateDefinition['suspects'][number];

// Key stored in interrogationsDone: "suspect:clue", or "suspect:" without a clue
export function interrogationKey(suspectId: string, clueId?: string): string {
  return `${suspectId}:${clueId ?? ''}`;
}

// Question a suspect in the current room. The status, time, version and log are handled by the engine.
export function interrogate(
  definition: InterrogateDefinition,
  state: GameState,
  action: InterrogateAction,
  _die: Die,
): { state: GameState; event: GameEvent } {
  const { suspectId, clueId } = action;

  // Every check happens before any change (INV-02)
  const suspect = definition.suspects.find((candidate) => candidate.id === suspectId);
  if (!suspect) {
    throw new DomainError('UNKNOWN_SUSPECT', 'Ce suspect n’existe pas.');
  }

  const room = definition.rooms.find((candidate) => candidate.id === state.currentRoom);
  if (!room?.suspects.includes(suspect.id)) {
    throw new DomainError('SUSPECT_ABSENT', `${suspect.name} n’est pas dans cette pièce.`);
  }

  if (clueId !== undefined) {
    // Branch added by #40: showing a clue from the notebook
    throw new DomainError('INVALID_REQUEST', 'Présenter un indice n’est pas encore possible.');
  }

  return askWithoutClue(definition, state, suspect);
}

// Base statement (#38): obtained once, refused for free the next time
function askWithoutClue(
  definition: InterrogateDefinition,
  state: GameState,
  suspect: Suspect,
): { state: GameState; event: GameEvent } {
  const line = definition.interrogations.find(
    (candidate) => candidate.suspectId === suspect.id && candidate.presentedClue === null,
  );

  // No base statement planned: a game failure that still uses the action, not a refusal
  if (!line) {
    return {
      state: structuredClone(state),
      event: { type: 'interrogation', result: 'no_effect', text: 'Je n’ai rien à vous dire.' },
    };
  }

  return reveal(definition, state, line.reveals, interrogationKey(suspect.id));
}

// Add a testimony to the notebook, with its item if any. Shared with the clue branch of #40.
function reveal(
  definition: InterrogateDefinition,
  state: GameState,
  testimonyId: string,
  key: string,
): { state: GameState; event: GameEvent } {
  if (state.obtainedRevelations.includes(testimonyId) || state.notebook.includes(testimonyId)) {
    throw new DomainError('ALREADY_OBTAINED', 'Vous avez déjà obtenu ce témoignage.');
  }

  const testimony = definition.clues.find((clue) => clue.id === testimonyId);
  if (testimony?.source !== 'interrogation') {
    // A broken scenario, not a player refusal
    throw new Error(`Le témoignage "${testimonyId}" doit être un indice de source « interrogation ».`);
  }

  // Never change the received state
  const newState = structuredClone(state);
  newState.notebook.push(testimony.id);
  newState.obtainedRevelations.push(testimony.id);
  if (!newState.interrogationsDone.includes(key)) {
    newState.interrogationsDone.push(key);
  }

  const obtainedItems: string[] = [];
  const item = testimony.givenItem;
  if (item && !newState.items.includes(item)) {
    newState.items.push(item);
    obtainedItems.push(item);
  }

  return {
    state: newState,
    event: {
      type: 'interrogation',
      result: 'revelation',
      text: testimony.text,
      obtainedClues: [testimony.id],
      obtainedItems,
    },
  };
}
