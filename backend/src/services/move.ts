import { DomainError } from './domain-error.ts';
import type { Action, Die, GameEvent, GameState } from './game.ts';

// Parts of the scenario definition needed by the movement
export type MoveDefinition = {
  rooms: { id: string; name: string; description: string; adjacent: string[]; requiredKey: string | null }[];
};

export type MoveAction = Extract<Action, { type: 'move' }>;

// Go to an adjacent room, unlocking it for good with its key. The status and time are handled by the engine.
export function move(
  definition: MoveDefinition,
  state: GameState,
  action: MoveAction,
  _die: Die,
): { state: GameState; event: GameEvent } {
  const { roomId } = action;

  // Every check happens before any change (INV-02)
  const target = definition.rooms.find((room) => room.id === roomId);
  if (!target) {
    throw new DomainError('UNKNOWN_ROOM', 'Cette pièce n’existe pas.');
  }

  const current = definition.rooms.find((room) => room.id === state.currentRoom);
  if (!current?.adjacent.includes(roomId)) {
    throw new DomainError('ROOM_NOT_ADJACENT', 'Cette pièce n’est pas accessible depuis l’endroit où vous êtes.');
  }

  const key = target.requiredKey;
  const unlocking = key !== null && !state.unlockedRooms.includes(roomId);
  if (unlocking && !state.items.includes(key)) {
    throw new DomainError('ROOM_LOCKED', 'La porte du bureau est fermée à clé.');
  }

  // Never change the received state
  const newState = structuredClone(state);
  newState.currentRoom = roomId;
  if (unlocking) {
    newState.unlockedRooms.push(roomId);
  }

  const description = `${target.name}. ${target.description}`;
  const event: GameEvent = {
    type: 'movement',
    result: 'success',
    text: unlocking ? `Vous déverrouillez la porte. ${description}` : description,
  };

  return { state: newState, event };
}
