import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { GameActions } from '../hooks/useGame.ts';
import { atDawn, beforeLockedDoor, inHall } from '../pages/demo-games.ts';
import type { Game } from '../services/game.ts';
import InnMap from './InnMap.tsx';

function renderMap(game: Game, loading = false) {
  const actions = { move: vi.fn() } as unknown as GameActions;
  render(<InnMap game={game} loading={loading} actions={actions} />);
  return actions.move;
}

test('shows the 6 rooms and marks the current one with a text', () => {
  renderMap(inHall);

  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  const here = screen.getByText('Vous êtes ici');
  expect(here.parentElement).toHaveTextContent('Salle commune');
});

test('makes only the adjacent rooms clickable', () => {
  renderMap(inHall);

  const buttons = screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'));
  expect(buttons).toEqual(['Aller à : Cuisine', 'Aller à : Couloir des chambres', 'Aller à : Écurie']);
  expect(screen.getByText('Cave').closest('button')).toBeNull();
  expect(screen.getByText('Bureau d’Armand').closest('button')).toBeNull();
});

test('asks to move to the clicked adjacent room', () => {
  const move = renderMap(inHall);

  fireEvent.click(screen.getByRole('button', { name: 'Aller à : Écurie' }));

  expect(move).toHaveBeenCalledTimes(1);
  expect(move).toHaveBeenCalledWith('ecurie');
});

test('marks a locked room with a padlock and a text', () => {
  renderMap(beforeLockedDoor);
  const locked = screen.getByRole('button', { name: 'Aller à : Bureau d’Armand (verrouillée)' });

  expect(locked.querySelector('svg')).toBeInTheDocument();
  expect(within(locked).getByText('(verrouillée)')).toBeInTheDocument();
});

test.each([
  ['during a request', inHall, true],
  ['at dawn', atDawn, false],
])('disables the rooms %s', (_case, game, loading) => {
  renderMap(game, loading);

  for (const button of screen.getAllByRole('button')) {
    expect(button).toBeDisabled();
  }
});
