import { DomainError } from './domain-error.ts';
import type { Action, GameEvent, GameState } from './game.ts';

// Refuse the actions that the current status does not allow
export function checkStatus(state: GameState, actionType: Action['type']): void {
  if (state.status === 'victory' || state.status === 'defeat') {
    throw new DomainError('GAME_OVER', "L'enquête est terminée.");
  }

  if (state.status === 'dawn' && actionType !== 'accuse') {
    throw new DomainError('DAWN_ACCUSATION_ONLY', "L'aube est levée : il ne vous reste qu'à accuser.");
  }
}

// Use one action and start dawn after the last one
export function advanceTime(state: GameState, event: GameEvent): { state: GameState; event: GameEvent } {
  // A bug, not a player refusal: INV-01 must never be broken
  if (state.remainingActions <= 0) {
    throw new Error('INV-01: no remaining actions');
  }

  const newState = structuredClone(state);
  const newEvent = structuredClone(event);

  newState.remainingActions -= 1;

  if (newState.remainingActions === 0 && newState.accusation === null) {
    newState.status = 'dawn';
    newEvent.text += " L'aube pointe : il ne vous reste plus qu'à accuser.";
  }

  return { state: newState, event: newEvent };
}
