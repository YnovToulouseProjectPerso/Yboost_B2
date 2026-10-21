// Player view returned by the API (docs/04-api-contract.md, `Game` object)

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

export type Suspect = { id: string; name: string; role: string };

export type NotebookClue = {
  id: string;
  title: string;
  text: string;
  source: 'search' | 'interrogation';
  location: string;
};

export type Game = {
  gameId: string;
  seed: number;
  version: number;
  status: GameStatus;
  remainingActions: number;
  time: string;
  currentRoom: { id: string; name: string; description: string; fullySearched: boolean };
  adjacentRooms: { id: string; name: string; locked: boolean }[];
  presentSuspects: Suspect[];
  notebook: NotebookClue[];
  items: { id: string; name: string }[];
  lastEvent: GameEvent;
  suspects: Suspect[];
  log: LogEntry[];
};
