import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { GameActions, GameError } from '../hooks/useGame.ts';
import type { Game, GameStatus } from '../services/game.ts';
import GameScreen from './GameScreen.tsx';

// Invented data, never the real scenario solution
function createGame(status: GameStatus): Game {
  return {
    gameId: 'p_test',
    seed: 42,
    version: 4,
    status,
    remainingActions: status === 'dawn' ? 0 : 8,
    time: status === 'dawn' ? '7h00' : '3h00',
    currentRoom: { id: 'a', name: 'Pièce A', description: '…', fullySearched: false },
    adjacentRooms: [],
    presentSuspects: [],
    notebook: [
      { id: 'c1', title: 'Gant taché', text: '…', source: 'search', location: 'Pièce A' },
      { id: 'c2', title: 'Lettre déchirée', text: '…', source: 'search', location: 'Pièce B' },
    ],
    items: [],
    lastEvent: { type: 'search', result: 'success', text: '…' },
    suspects: [{ id: 'x', name: 'Suspect X', role: 'Colporteur' }],
    log: [{ version: 1, type: 'search', result: 'success', text: 'Un gant taché.' }],
  };
}

function createActions(): GameActions {
  return { newGame: vi.fn(), move: vi.fn(), search: vi.fn(), interrogate: vi.fn(), accuse: vi.fn(), loadSummary: vi.fn() };
}

function renderScreen(game: Game, { loading = false, error = null as GameError | null } = {}) {
  const actions = createActions();
  const view = render(<GameScreen game={game} loading={loading} actions={actions} error={error} />);
  const rerender = (nextError: GameError | null) =>
    view.rerender(<GameScreen game={game} loading={loading} actions={actions} error={nextError} />);
  return { actions, rerender };
}

const accuseButton = () => screen.getByRole('button', { name: 'Accuser' });

test('during the game: no dawn banner, « Accuser » opens the accusation modal', () => {
  renderScreen(createGame('in_progress'));

  expect(screen.queryByText(/dernière chance/)).not.toBeInTheDocument();
  expect(accuseButton()).toBeEnabled();

  fireEvent.click(accuseButton());

  expect(screen.getByRole('dialog', { name: 'Accuser' })).toBeInTheDocument();
});

test('at dawn: the last chance banner is shown and « Accuser » stays enabled', () => {
  renderScreen(createGame('dawn'));

  expect(screen.getByText(/L’aube se lève : dernière chance/)).toBeInTheDocument();
  expect(accuseButton()).toBeEnabled();
});

test('while loading: « Accuser » is disabled', () => {
  renderScreen(createGame('in_progress'), { loading: true });

  expect(accuseButton()).toBeDisabled();
});

test('shows the action log', () => {
  renderScreen(createGame('in_progress'));

  expect(screen.getByText('Historique (1 action)')).toBeInTheDocument();
});

test('shows a refusal received while the modal is open, inside the modal', () => {
  const { rerender } = renderScreen(createGame('in_progress'));
  fireEvent.click(accuseButton());

  rerender({ message: 'Vous ne possédez pas cet indice dans votre carnet.' });

  const dialog = screen.getByRole('dialog', { name: 'Accuser' });
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Vous ne possédez pas cet indice dans votre carnet.');
});

test('does not show inside the modal an error that was already there before opening it', () => {
  renderScreen(createGame('in_progress'), { error: { message: 'Cette porte est verrouillée.' } });

  fireEvent.click(accuseButton());

  expect(within(screen.getByRole('dialog', { name: 'Accuser' })).queryByRole('alert')).not.toBeInTheDocument();
});