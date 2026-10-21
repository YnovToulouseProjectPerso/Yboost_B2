import { DomainError } from './domain-error.ts';
import { actionRules } from './action-rules.ts';
import type { Action, Die, GameEvent, GameState } from './game.ts';

export function controlGameStatus(state: GameState, action: Action): void {
  if (state.status === 'victory' || state.status === 'defeat') {
    throw new DomainError('GAME_OVER', 'La partie est déjà terminée.');
  }

  if (state.status === 'dawn' && action.type !== 'accuse') {
    throw new DomainError(
      'DAWN_ACCUSATION_ONLY',
      'À l’aube, vous ne pouvez plus que porter une accusation.',
    );
  }
}

export function advanceTime(state: GameState): GameState {
  const next = {
    ...state,
    remainingActions: state.remainingActions - 1,
  };

  if (next.remainingActions === 0) {
    next.status = 'dawn';
  }

  return next;
}

export function applyAction(
  state: GameState,
  action: Action,
  die: Die,
): { state: GameState; event: GameEvent } {
  controlGameStatus(state, action);

  const rule = actionRules[action.type];
  if (!rule) {
    throw new Error(`No rule registered for action "${action.type}".`);
  }

  const { state: ruleState, event } = rule(
    structuredClone(state),
    action,
    die,
  );
  let next = structuredClone(ruleState);

  if (action.type !== 'accuse') {
    next = advanceTime(next);
  }

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
