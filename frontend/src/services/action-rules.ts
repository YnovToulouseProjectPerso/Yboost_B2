import type { Game } from './game.ts';

export type ActionType = 'move' | 'search' | 'interrogate' | 'accuse';

// Shared rule for every action button of the game screen. The server still has the last word.
export function isActionAllowed(game: Pick<Game, 'status'>, loading: boolean, actionType: ActionType): boolean {
  if (loading) return false;
  if (game.status === 'in_progress') return true;
  if (game.status === 'dawn') return actionType === 'accuse';
  return false;
}
