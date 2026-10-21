import { describe, it, expect } from "vitest";

import {
  checkStatus,
  advanceTime,
  DomainError,
  type GameState,
  type GameEvent
} from "../src/engine/gameStatus";

// Create a game state for testing
function createState(): GameState {
  return {
    status: "in_progress",
    remainingActions: 12,
    accusation: null
  };
}

describe("checkStatus", () => {
  it("allows actions during the game", () => {
    const state = createState();

    expect(() => checkStatus(state, "move")).not.toThrow();
    expect(() => checkStatus(state, "search")).not.toThrow();
    expect(() => checkStatus(state, "interrogate")).not.toThrow();
    expect(() => checkStatus(state, "accuse")).not.toThrow();
  });

  it("allows accusation at dawn", () => {
    const state = createState();
    state.status = "dawn";

    expect(() => checkStatus(state, "accuse")).not.toThrow();
  });

  it("blocks other actions at dawn", () => {
    const state = createState();
    state.status = "dawn";

    expect(() => checkStatus(state, "search")).toThrow(
      "L'aube est levée : il ne vous reste qu'à accuser."
    );
  });

  it("blocks actions when the game is finished", () => {
    const state = createState();
    state.status = "victory";

    expect(() => checkStatus(state, "move")).toThrow(
      "L'enquête est terminée."
    );
  });

  it("returns the correct error code", () => {
    const state = createState();
    state.status = "defeat";

    try {
      checkStatus(state, "move");
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);

      if (error instanceof DomainError) {
        expect(error.code).toBe("GAME_OVER");
        expect(error.statusCode).toBe(409);
      }
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
    expect(result.event.text).toContain("L'aube pointe");
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

    advanceTime(state, event);

    expect(state).toEqual(originalState);
    expect(event).toEqual(originalEvent);
  });
});