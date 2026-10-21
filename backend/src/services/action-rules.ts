import type { Action, Die, GameEvent, GameState } from './game.ts';

export type ActionRule = (
  state: GameState,
  action: Action,
  die: Die,
) => { state: GameState; event: GameEvent };

export const actionRules: Partial<Record<Action['type'], ActionRule>> = {};
