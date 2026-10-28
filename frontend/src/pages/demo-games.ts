import type { Game } from '../services/game.ts';

// Simulated games that follow the API contract, for the dev demo (/#demo) and the tests, until the real wiring (#14)
function demoGame(
  currentRoom: Pick<Game['currentRoom'], 'id' | 'name'>,
  adjacentRooms: Game['adjacentRooms'],
  overrides: Partial<Game> = {},
): Game {
  return {
    gameId: 'p_demo',
    seed: 42,
    version: 0,
    status: 'in_progress',
    remainingActions: 12,
    time: '1h00',
    currentRoom: { ...currentRoom, description: 'Description de la pièce.', fullySearched: false },
    adjacentRooms,
    presentSuspects: [],
    notebook: [],
    items: [],
    lastEvent: { type: 'introduction', result: null, text: '1h00.' },
    suspects: [],
    log: [],
    ...overrides,
  };
}

export const inHall = demoGame({ id: 'hall', name: 'Salle commune' }, [
  { id: 'cuisine', name: 'Cuisine', locked: false },
  { id: 'couloir', name: 'Couloir des chambres', locked: false },
  { id: 'ecurie', name: 'Écurie', locked: false },
]);

export const beforeLockedDoor = demoGame(
  { id: 'couloir', name: 'Couloir des chambres' },
  [
    { id: 'hall', name: 'Salle commune', locked: false },
    { id: 'office', name: 'Bureau d’Armand', locked: true },
  ],
  { version: 1, remainingActions: 11, time: '1h30' },
);

export const atDawn = demoGame(
  { id: 'cuisine', name: 'Cuisine' },
  [
    { id: 'hall', name: 'Salle commune', locked: false },
    { id: 'cellar', name: 'Cave', locked: false },
  ],
  { version: 12, status: 'dawn', remainingActions: 0, time: '7h00' },
);

export const nowhereToGo = demoGame({ id: 'hall', name: 'Salle commune' }, []);
