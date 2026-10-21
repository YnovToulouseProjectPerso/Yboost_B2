
import { describe, it, expect } from "vitest";

import {
  checkStatus,
  advanceTime,
  type GameState,
  type GameEvent,
  type ActionType
} from "../src/engine/gameStatus";

import { DomainError } from "../src/services/domain-error";

// Create a game state for testing
function createState(): GameState {
  return {
    status: "in_progress",
    remainingActions: 12,
    accusation: null
  };
}

// Check error code and message
function expectDomainError(
  action: () => void,
  code: string,
  message: string
): void {
  try {
    action();
    throw new Error("Expected a DomainError");
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);

    if (error instanceof DomainError) {
      expect(error.code).toBe(code);
      expect(error.message).toBe(message);
    }
  }
}

describe("checkStatus", () => {
  const actions: ActionType[] = [
    "move",
    "search",
    "interrogate",
    "accuse"
  ];

  it("allows all actions during the game", () => {
    const state = createState();

    for (const action of actions) {
      expect(() => checkStatus(state, action)).not.toThrow();
    }
  });

  it("allows accusation at dawn", () => {
    const state = createState();
    state.status = "dawn";

    expect(() => checkStatus(state, "accuse")).not.toThrow();
  });

  it("blocks other actions at dawn", () => {
    const state = createState();
    state.status = "dawn";

    for (const action of actions.filter(a => a !== "accuse")) {
      expectDomainError(
        () => checkStatus(state, action),
        "DAWN_ACCUSATION_ONLY",
        "L'aube est levée : il ne vous reste qu'à accuser."
      );
    }
  });

  it("blocks all actions after victory", () => {
    const state = createState();
    state.status = "victory";

    for (const action of actions) {
      expectDomainError(
        () => checkStatus(state, action),
        "GAME_OVER",
        "L'enquête est terminée."
      );
    }
  });

  it("blocks all actions after defeat", () => {
    const state = createState();
    state.status = "defeat";

    for (const action of actions) {
      expectDomainError(
        () => checkStatus(state, action),
        "GAME_OVER",
        "L'enquête est terminée."
      );
    }
  });

  it("does not change the original state", () => {
    const state = createState();
    const original = structuredClone(state);

    checkStatus(state, "move");

    expect(state).toEqual(original);
  });
});

describe("advanceTime", () => {
  it("removes one action", () => {
    const state = createState();
    const event: GameEvent = { text: "Player moves." };

    const result = advanceTime(state, event);

    expect(result.state.remainingActions).toBe(11);
  });

  it("starts dawn after the last action", () => {
    const state = createState();
    state.remainingActions = 1;

    const event: GameEvent = { text: "Player searches." };

    const result = advanceTime(state, event);

    expect(result.state.remainingActions).toBe(0);
    expect(result.state.status).toBe("dawn");
    expect(result.event.text).toBe(
      "Player searches. L'aube pointe : il ne vous reste plus qu'à accuser."
    );
  });

  it("does not start dawn if an accusation exists", () => {
    const state = createState();
    state.remainingActions = 1;
    state.accusation = "suspect-1";

    const event: GameEvent = { text: "Action completed." };

    const result = advanceTime(state, event);

    expect(result.state.remainingActions).toBe(0);
    expect(result.state.status).toBe("in_progress");
  });

  it("throws an error when no actions remain", () => {
    const state = createState();
    state.remainingActions = 0;

    const event: GameEvent = { text: "Player moves." };

    expect(() => advanceTime(state, event)).toThrow("INV-01");
  });

  it("does not change the original objects", () => {
    const state = createState();
    const event: GameEvent = { text: "Player moves." };

    const originalState = structuredClone(state);
    const originalEvent = structuredClone(event);

    const result = advanceTime(state, event);

    expect(state).toEqual(originalState);
    expect(event).toEqual(originalEvent);
    expect(result.state).not.toBe(state);
    expect(result.event).not.toBe(event);
  });
});
