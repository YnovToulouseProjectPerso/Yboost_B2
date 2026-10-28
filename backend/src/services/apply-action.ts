import { actionRules } from './action-rules.ts';
import { advanceTime, checkStatus } from './game-status.ts';
import type { Action, Die, GameEvent, GameState } from './game.ts';

export function applyAction(
  state: GameState,
  action: Action,
  die: Die,
): { state: GameState; event: GameEvent } {
  checkStatus(state, action.type);

  const rule = actionRules[action.type];
  if (!rule) {
    throw new Error(`No rule registered for action "${action.type}".`);
  }

  let result = rule(structuredClone(state), action, die);

  if (action.type !== 'accuse') {
    result = advanceTime(result.state, result.event);
  }

  const { state: next, event } = result;
  const version = state.version + 1;
  return {
    state: {
      ...next,
      version,
      log: [
        ...state.log,
        {
          version,
          type: event.type,
          result: event.result,
          text: event.text,
        },
      ],
    },
    event,
  };
}
