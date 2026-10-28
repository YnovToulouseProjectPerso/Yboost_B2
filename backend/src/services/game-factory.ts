import { randomBytes } from 'node:crypto';
import type { Game, GameState, LogEntry } from './game.ts';

export type GameDefinition = {
  rules: {
    initialActions: number;
    startRoom: string;
    startTime: string;
  };
  introduction: string;
  rooms: {
    id: string;
    name: string;
    description: string;
    adjacent: string[];
    requiredKey: string | null;
    suspects: string[];
  }[];
  suspects: { id: string; name: string; role: string }[];
  clues: {
    id: string;
    title: string;
    text: string;
    source: 'search' | 'interrogation';
    location: string;
    evidenceAgainst?: string | null;
  }[];
  items: { id: string; name: string }[];
};

function assertDefinition(definition: GameDefinition): void {
  const { initialActions, startRoom, startTime } = definition.rules;
  if (!Number.isSafeInteger(initialActions) || initialActions <= 0) {
    throw new RangeError('Le nombre initial d’actions doit être un entier positif.');
  }
  if (!definition.rooms.some((room) => room.id === startRoom)) {
    throw new RangeError(`La pièce de départ "${startRoom}" est absente de la définition.`);
  }
  if (!/^\d{1,2}h(?:[0-5]\d)$/.test(startTime)) {
    throw new RangeError('L’heure de départ doit respecter le format « 1h00 ».');
  }
  if (typeof definition.introduction !== 'string') {
    throw new TypeError('Le texte d’introduction est absent de la définition.');
  }
}

function roomById(definition: GameDefinition, roomId: string): GameDefinition['rooms'][number] {
  const room = definition.rooms.find((candidate) => candidate.id === roomId);
  if (!room) {
    throw new RangeError(`La pièce "${roomId}" est absente de la définition.`);
  }
  return room;
}

function suspectView(definition: GameDefinition, suspectId: string): { id: string; name: string; role: string } {
  const suspect = definition.suspects.find((candidate) => candidate.id === suspectId);
  if (!suspect) {
    throw new RangeError(`Le suspect "${suspectId}" est absent de la définition.`);
  }
  return { id: suspect.id, name: suspect.name, role: suspect.role };
}

function elapsedTime(startTime: string, elapsedActions: number): string {
  const match = /^(\d{1,2})h([0-5]\d)$/.exec(startTime);
  if (!match) {
    throw new RangeError('L’heure de départ doit respecter le format « 1h00 ».');
  }

  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const totalMinutes = startMinutes + elapsedActions * 30;
  return `${Math.floor(totalMinutes / 60)}h${String(totalMinutes % 60).padStart(2, '0')}`;
}

export function createState(definition: GameDefinition, seed: number): GameState {
  assertDefinition(definition);
  if (!Number.isSafeInteger(seed) || seed <= 0) {
    throw new RangeError('La graine doit être un entier positif sûr.');
  }

  return {
    gameId: `p_${randomBytes(6).toString('hex')}`,
    seed,
    dieState: 0,
    version: 0,
    status: 'in_progress',
    remainingActions: definition.rules.initialActions,
    currentRoom: definition.rules.startRoom,
    unlockedRooms: [],
    items: [],
    notebook: [],
    searches: {},
    obtainedRevelations: [],
    interrogationsDone: [],
    accusation: null,
    log: [{
      version: 0,
      type: 'introduction',
      result: null,
      text: definition.introduction,
    }],
  };
}

export function buildView(definition: GameDefinition, state: GameState): Game {
  assertDefinition(definition);
  const currentRoom = roomById(definition, state.currentRoom);
  const elapsedActions = definition.rules.initialActions - state.remainingActions;

  if (!Number.isSafeInteger(state.remainingActions) || state.remainingActions < 0 ||
      state.remainingActions > definition.rules.initialActions) {
    throw new RangeError('Le nombre d’actions restantes est incohérent avec la définition.');
  }

  const lastLogEntry = state.log.at(-1);
  if (!lastLogEntry) {
    throw new RangeError('Le journal de la partie ne contient aucun événement.');
  }

  const log: LogEntry[] = state.log.map(({ version, type, result, text }) => ({
    version,
    type,
    result,
    text,
  }));
  const cluesInRoom = definition.clues.filter(
    (clue) => clue.location === currentRoom.id && clue.source === 'search',
  ).length;
  const search = state.searches[currentRoom.id];

  return {
    gameId: state.gameId,
    seed: state.seed,
    version: state.version,
    status: state.status,
    remainingActions: state.remainingActions,
    time: elapsedTime(definition.rules.startTime, elapsedActions),
    currentRoom: {
      id: currentRoom.id,
      name: currentRoom.name,
      description: currentRoom.description,
      fullySearched: search !== undefined && search.found >= cluesInRoom,
    },
    adjacentRooms: currentRoom.adjacent.map((roomId) => {
      const room = roomById(definition, roomId);
      return {
        id: room.id,
        name: room.name,
        locked: room.requiredKey !== null && !state.unlockedRooms.includes(room.id),
      };
    }),
    presentSuspects: currentRoom.suspects.map((suspectId) => suspectView(definition, suspectId)),
    notebook: state.notebook.map((clueId) => {
      const clue = definition.clues.find((candidate) => candidate.id === clueId);
      if (!clue) {
        throw new RangeError(`L’indice "${clueId}" est absent de la définition.`);
      }
      return {
        id: clue.id,
        title: clue.title,
        text: clue.text,
        source: clue.source,
        location: clue.location,
      };
    }),
    items: state.items.map((itemId) => {
      const item = definition.items.find((candidate) => candidate.id === itemId);
      if (!item) {
        throw new RangeError(`L’objet "${itemId}" est absent de la définition.`);
      }
      return { id: item.id, name: item.name };
    }),
    lastEvent: {
      type: lastLogEntry.type,
      result: lastLogEntry.result,
      text: lastLogEntry.text,
    },
    suspects: definition.suspects.map(({ id, name, role }) => ({ id, name, role })),
    log,
  };
}
