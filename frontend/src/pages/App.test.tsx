import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import * as api from '../services/api.ts';
import { ApiError, NETWORK_MESSAGE } from '../services/api.ts';
import type { Game, GameStatus } from '../services/game.ts';
import App from './App.tsx';

vi.mock(import('../services/api.ts'), async (importOriginal) => ({
  ...(await importOriginal()),
  createGame: vi.fn(),
  getGame: vi.fn(),
}));

function createGame(status: GameStatus): Game {
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
  };
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

  render(<App />);

  expect(await screen.findByRole('heading', { level: 1, name: 'L’aube' })).toBeInTheDocument();
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
