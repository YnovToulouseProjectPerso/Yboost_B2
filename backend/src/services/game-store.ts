import { DomainError } from './domain-error.ts';
import type { GameState } from './game.ts';

export type GameStore = Map<string, GameState>;

export function findState(games: GameStore, gameId: string): GameState {
  const state = games.get(gameId);

  if (!state) {
    throw new DomainError('GAME_NOT_FOUND', 'Cette partie n’existe pas, ou le serveur a redémarré.');
  }

  return state;
}
