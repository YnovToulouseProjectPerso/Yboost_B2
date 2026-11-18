import { randomBytes } from 'node:crypto';
import { applyAction } from './apply-action.ts';
import type { Engine } from './game.ts';
import { scenario } from './scenario.ts';

const introduction = '1h00. Un cri traverse l’auberge…';
const initialActions = 12;

function roomById(roomId: string): (typeof scenario.rooms)[number] {
  const room = scenario.rooms.find((candidate) => candidate.id === roomId);
  if (!room) {
    throw new RangeError(`La pièce "${roomId}" est absente du scénario.`);
  }
  return room;
}

// Each action takes half an hour from 1h00
function timeAfter(elapsedActions: number): string {
  const minutes = 60 + elapsedActions * 30;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

export const provisionalEngine: Engine = {
  createState: (seed) => ({
    gameId: `p_${randomBytes(6).toString('hex')}`,
    seed,
    dieState: 0,
    version: 0,
    status: 'in_progress',
    remainingActions: initialActions,
    currentRoom: 'hall',
    unlockedRooms: [],
    items: [],
    notebook: [],
    searches: {},
    obtainedRevelations: [],
    interrogationsDone: [],
    accusation: null,
    log: [{ version: 0, type: 'introduction', result: null, text: introduction }],
  }),

  buildView: (state) => {
    const { type, result, text } = state.log[state.log.length - 1];
    const currentRoom = roomById(state.currentRoom);

    return {
      gameId: state.gameId,
      seed: state.seed,
      version: state.version,
      status: state.status,
      remainingActions: state.remainingActions,
      time: timeAfter(initialActions - state.remainingActions),
      currentRoom: { id: currentRoom.id, name: currentRoom.name, description: currentRoom.description, fullySearched: false },
      adjacentRooms: currentRoom.adjacent.map((roomId) => {
        const room = roomById(roomId);
        return { id: room.id, name: room.name, locked: room.requiredKey !== null && !state.unlockedRooms.includes(room.id) };
      }),
      presentSuspects: [],
      notebook: [],
      items: [],
      lastEvent: { type, result, text },
      suspects: [],
      log: state.log,
    };
  },

  createDie: (_seed, position) => ({ die: () => 6, position: () => position }),

  applyAction,
};
