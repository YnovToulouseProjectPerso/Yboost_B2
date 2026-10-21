export type GameStatus = 'in_progress' | 'dawn' | 'victory' | 'defeat';

export type EventType = 'introduction' | 'movement' | 'search' | 'interrogation' | 'accusation' | 'dawn';

export type GameEvent = {
  type: EventType;
  result: string | null;
  text: string;
  obtainedClues?: string[];
  obtainedItems?: string[];
};

export type LogEntry = {
  version: number;
  type: EventType;
  result: string | null;
  text: string;
};

export type GameState = {
  gameId: string;
  seed: number;
  dieState: number;
  version: number;
  status: GameStatus;
  remainingActions: number;
  currentRoom: string;
  unlockedRooms: string[];
  items: string[];
  notebook: string[];
  searches: Record<string, { found: number; previousFailure: boolean }>;
  obtainedRevelations: string[];
  interrogationsDone: string[];
  accusation: { suspectId: string; evidence: string[]; correct: boolean } | null;
  log: LogEntry[];
};

type SuspectView = { id: string; name: string; role: string };

export type Game = {
  gameId: string;
  seed: number;
  version: number;
  status: GameStatus;
  remainingActions: number;
  time: string;
  currentRoom: { id: string; name: string; description: string; fullySearched: boolean };
  adjacentRooms: { id: string; name: string; locked: boolean }[];
  presentSuspects: SuspectView[];
  notebook: { id: string; title: string; text: string; source: 'search' | 'interrogation'; location: string }[];
  items: { id: string; name: string }[];
  lastEvent: GameEvent;
  suspects: SuspectView[];
  log: LogEntry[];
};

export type Engine = {
  createState(seed: number): GameState;
  buildView(state: GameState): Game;
};
