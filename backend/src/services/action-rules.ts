import { accuse } from './accuse.ts';
import type { Action, Die, GameEvent, GameState } from './game.ts';
import { scenario } from './scenario.ts';

export type ActionRule = (
  state: GameState,
  action: Action,
  die: Die,
) => { state: GameState; event: GameEvent };

export const actionRules: Partial<Record<Action['type'], ActionRule>> = {
  accuse: (state, action, die) => accuse(scenario, state, action as Extract<Action, { type: 'accuse' }>, die),
};
