
import { DomainError } from "../services/domain-error";

// Possible game statuses
export type GameStatus = "in_progress" | "dawn" | "victory" | "defeat";

// Possible player actions
export type ActionType = "move" | "search" | "interrogate" | "accuse";

// Game state
export interface GameState {
  status: GameStatus;
  remainingActions: number;
  accusation: unknown | null;
}

// Game event
export interface GameEvent {
  text: string;
}

// Check if the player can perform an action
export function checkStatus(
  state: GameState,
  actionType: ActionType
): void {
  // Block actions when the game is finished
  if (state.status === "victory" || state.status === "defeat") {
    throw new DomainError(
      "GAME_OVER",
      "L'enquête est terminée."
    );
  }

  // Only accusation is allowed at dawn
  if (state.status === "dawn" && actionType !== "accuse") {
    throw new DomainError(
      "DAWN_ACCUSATION_ONLY",
      "L'aube est levée : il ne vous reste qu'à accuser."
    );
  }
}

// Decrease the remaining actions
export function advanceTime(
  state: GameState,
  event: GameEvent
): { state: GameState; event: GameEvent } {
  // Stop when no actions remain
  if (state.remainingActions <= 0) {
    throw new Error("INV-01: No remaining actions");
  }

  // Copy objects without changing the originals
  const newState = structuredClone(state);
  const newEvent = structuredClone(event);

  // Use one action
  newState.remainingActions -= 1;

  // Start dawn after the last action
  if (
    newState.remainingActions === 0 &&
    newState.accusation == null
  ) {
    newState.status = "dawn";
    newEvent.text +=
      " L'aube pointe : il ne vous reste plus qu'à accuser.";
  }

  return { state: newState, event: newEvent };
}
