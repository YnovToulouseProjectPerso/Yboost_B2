import { describe, expect, test } from 'vitest';
import type { GameStatus } from './game.ts';
import { isActionAllowed, type ActionType } from './action-rules.ts';

const actionTypes: ActionType[] = ['move', 'search', 'interrogate', 'accuse'];

const cases: { status: GameStatus; loading: boolean; allowed: ActionType[] }[] = [
  { status: 'in_progress', loading: false, allowed: ['move', 'search', 'interrogate', 'accuse'] },
  { status: 'dawn', loading: false, allowed: ['accuse'] },
  { status: 'victory', loading: false, allowed: [] },
  { status: 'defeat', loading: false, allowed: [] },
  { status: 'in_progress', loading: true, allowed: [] },
  { status: 'dawn', loading: true, allowed: [] },
  { status: 'victory', loading: true, allowed: [] },
  { status: 'defeat', loading: true, allowed: [] },
];

describe('isActionAllowed', () => {
  for (const { status, loading, allowed } of cases) {
    for (const actionType of actionTypes) {
      const expected = allowed.includes(actionType);

      test(`${status}${loading ? ' while loading' : ''}: ${actionType} → ${expected ? 'yes' : 'no'}`, () => {
        expect(isActionAllowed({ status }, loading, actionType)).toBe(expected);
      });
    }
  }
});
