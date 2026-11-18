import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import * as api from '../services/api.ts';
import { ApiError, NETWORK_MESSAGE } from '../services/api.ts';
import type { Game, GameStatus, Summary } from '../services/game.ts';
import App from './App.tsx';

vi.mock(import('../services/api.ts'), async (importOriginal) => ({
  ...(await importOriginal()),
  createGame: vi.fn(),
  getGame: vi.fn(),
  accuse: vi.fn(),
  getSummary: vi.fn(),
}));

function createGame(status: GameStatus, overrides: Partial<Game> = {}): Game {
  return {
    gameId: 'p_test',
    seed: 42,
    version: 0,
    status,
    remainingActions: 12,
    time: '1h00',
    currentRoom: { id: 'a', name: 'Pièce A', description: '…', fullySearched: false },
    adjacentRooms: [{ id: 'b', name: 'Pièce B', locked: false }],
    presentSuspects: [],
    notebook: [],
    items: [],
    lastEvent: { type: 'introduction', result: null, text: '1h00.' },
    suspects: [],
    log: [],
    ...overrides,
  };
}

// Invented data, never the real scenario solution
const playing = createGame('in_progress', {
  version: 4,
  notebook: [
    { id: 'c1', title: 'Gant taché', text: '…', source: 'search', location: 'Pièce A' },
    { id: 'c2', title: 'Lettre déchirée', text: '…', source: 'search', location: 'Pièce B' },
  ],
  suspects: [
    { id: 'x', name: 'Suspect X', role: 'Colporteur' },
    { id: 'y', name: 'Suspect Y', role: 'Cocher' },
  ],
});

const summary: Summary = {
  culprit: { id: 'x', name: 'Suspect X' },
  motive: 'Une vieille dette de jeu.',
  timeline: [{ time: '23h00', text: 'X monte à l’étage.' }],
  possibleEvidence: [
    { id: 'c1', title: 'Gant taché', obtained: true },
    { id: 'c2', title: 'Lettre déchirée', obtained: true },
  ],
  accusation: { suspectId: 'x', evidence: ['c1', 'c2'], correct: true },
};

async function openAccusationAndChoose() {
  sessionStorage.setItem('gameId', 'p_test');
  vi.mocked(api.getGame).mockResolvedValue(playing);
  render(<App />);

  fireEvent.click(await screen.findByRole('button', { name: 'Accuser' }));
  const dialog = screen.getByRole('dialog', { name: 'Accuser' });
  fireEvent.click(within(dialog).getByLabelText(/Suspect X/));
  fireEvent.click(within(dialog).getByLabelText('Gant taché'));
  fireEvent.click(within(dialog).getByLabelText('Lettre déchirée'));
  return dialog;
}

afterEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

test('opens on the home screen', () => {
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: 'La Dernière Auberge' })).toBeInTheDocument();
});

test('starts an investigation from the home screen', async () => {
  vi.mocked(api.createGame).mockResolvedValue(createGame('in_progress'));
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Nouvelle enquête' }));

  expect(await screen.findByRole('heading', { level: 1, name: 'L’enquête' })).toHaveFocus();
});

test('shows the end screen for a finished game', async () => {
  sessionStorage.setItem('gameId', 'p_test');
  vi.mocked(api.getGame).mockResolvedValue(createGame('victory'));
  vi.mocked(api.getSummary).mockResolvedValue(summary);

  render(<App />);

  expect(await screen.findByRole('heading', { level: 1, name: 'Victoire' })).toBeInTheDocument();
  expect(await screen.findByRole('region', { name: 'Le coupable' })).toHaveTextContent('Suspect X');
  expect(api.getSummary).toHaveBeenCalledTimes(1);
  expect(api.getSummary).toHaveBeenCalledWith('p_test');
});

test('accuses from the game screen, then shows the end screen with the summary from the server', async () => {
  vi.mocked(api.accuse).mockResolvedValue({
    event: { type: 'accusation', result: 'victory', text: 'Vos preuves sont accablantes.' },
    game: { ...playing, version: 5, status: 'victory' },
  });
  vi.mocked(api.getSummary).mockResolvedValue(summary);
  const dialog = await openAccusationAndChoose();

  fireEvent.click(within(dialog).getByRole('button', { name: 'Accuser' }));

  expect(await screen.findByRole('heading', { level: 1, name: 'Victoire' })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(api.accuse).toHaveBeenCalledTimes(1);
  expect(api.accuse).toHaveBeenCalledWith('p_test', 4, 'x', ['c1', 'c2']);
  expect(await screen.findByRole('region', { name: 'Votre accusation' })).toHaveTextContent('Accusation correcte');
  expect(api.getSummary).toHaveBeenCalledTimes(1);
});

test('keeps the accusation modal open with the message of a refusal', async () => {
  vi.mocked(api.accuse).mockRejectedValue(
    new ApiError('rejection', 'Vous ne possédez pas cet indice dans votre carnet.', {
      status: 409,
      code: 'CLUE_NOT_OWNED',
    }),
  );
  const dialog = await openAccusationAndChoose();

  fireEvent.click(within(dialog).getByRole('button', { name: 'Accuser' }));

  expect(await within(dialog).findByRole('alert')).toHaveTextContent('Vous ne possédez pas cet indice dans votre carnet.');
  expect(screen.getByRole('dialog', { name: 'Accuser' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1, name: 'L’enquête' })).toBeInTheDocument();
});

test('“Rejouer la même partie” creates a new game with the same seed', async () => {
  sessionStorage.setItem('gameId', 'p_test');
  vi.mocked(api.getGame).mockResolvedValue(createGame('defeat', { seed: 421337 }));
  vi.mocked(api.getSummary).mockResolvedValue(summary);
  vi.mocked(api.createGame).mockResolvedValue(createGame('in_progress', { seed: 421337 }));
  render(<App />);
  await screen.findByRole('region', { name: 'Le coupable' });

  fireEvent.click(screen.getByRole('button', { name: 'Rejouer la même partie' }));

  expect(await screen.findByRole('heading', { level: 1, name: 'L’enquête' })).toBeInTheDocument();
  expect(api.createGame).toHaveBeenCalledWith(421337);
});

test('“Rejouer” creates a new game without seed', async () => {
  sessionStorage.setItem('gameId', 'p_test');
  vi.mocked(api.getGame).mockResolvedValue(createGame('victory'));
  vi.mocked(api.getSummary).mockResolvedValue(summary);
  vi.mocked(api.createGame).mockResolvedValue(createGame('in_progress', { seed: 7 }));
  render(<App />);
  await screen.findByRole('region', { name: 'Le coupable' });

  fireEvent.click(screen.getByRole('button', { name: 'Rejouer' }));

  expect(await screen.findByRole('heading', { level: 1, name: 'L’enquête' })).toBeInTheDocument();
  expect(api.createGame).toHaveBeenCalledWith(undefined);
});

test('shows the network error with a retry button that resends the request', async () => {
  vi.mocked(api.createGame)
    .mockRejectedValueOnce(new ApiError('network', NETWORK_MESSAGE))
    .mockResolvedValueOnce(createGame('in_progress'));
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Nouvelle enquête' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(NETWORK_MESSAGE);

  fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));

  expect(await screen.findByRole('heading', { level: 1, name: 'L’enquête' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('goes back home with a message when the stored game no longer exists', async () => {
  sessionStorage.setItem('gameId', 'p_old');
  vi.mocked(api.getGame).mockRejectedValue(
    new ApiError('rejection', 'Cette partie n’existe pas, ou le serveur a redémarré.', {
      status: 404,
      code: 'GAME_NOT_FOUND',
    }),
  );

  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Cette partie n’existe pas, ou le serveur a redémarré.');
  expect(screen.getByRole('heading', { level: 1, name: 'La Dernière Auberge' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Réessayer' })).not.toBeInTheDocument();
});