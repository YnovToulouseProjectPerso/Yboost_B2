import { randomBytes } from 'node:crypto';
import type { Engine } from './game.ts';

const introduction = '1h00. Un cri traverse l’auberge…';

export const provisionalEngine: Engine = {
  createState: (seed) => ({
    gameId: `p_${randomBytes(6).toString('hex')}`,
    seed,
    dieState: 0,
    version: 0,
    status: 'in_progress',
    remainingActions: 12,
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

    return {
      gameId: state.gameId,
      seed: state.seed,
      version: state.version,
      status: state.status,
      remainingActions: state.remainingActions,
      time: '1h00',
      currentRoom: { id: state.currentRoom, name: 'Salle commune', description: 'Le feu crépite encore dans la cheminée.', fullySearched: false },
      adjacentRooms: [],
      presentSuspects: [],
      notebook: [],
      items: [],
      lastEvent: { type, result, text },
      suspects: [],
      log: state.log,
    };
  },

  createDie: (_seed, position) => ({ die: () => 6, position: () => position }),

  applyAction: () => {
    throw new Error('The provisional engine cannot apply actions');
  },
};
