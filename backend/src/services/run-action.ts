import { DomainError } from './domain-error.ts';
import type { Action, Engine, Game, GameEvent } from './game.ts';
import { findState, type GameStore } from './game-store.ts';

export function runAction(
  engine: Engine,
  games: GameStore,
  gameId: string,
  clientVersion: number,
  action: Action,
): { event: GameEvent; game: Game } {
  const state = findState(games, gameId);

  try {
    if (clientVersion !== state.version) {
      throw new DomainError('STALE_VERSION', 'La partie a changé depuis votre dernier affichage : rien n’a été joué.');
    }

    const { die, position } = engine.createDie(state.seed, state.dieState);
    const result = engine.applyAction(structuredClone(state), action, die);
    const next = { ...result.state, dieState: position() };

    games.set(gameId, next);
    return { event: result.event, game: engine.buildView(next) };
  } catch (error) {
    if (error instanceof DomainError) {
      error.game = engine.buildView(state);
    }
    throw error;
  }
}
