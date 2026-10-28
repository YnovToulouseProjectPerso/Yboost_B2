import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import type { GameActions } from '../hooks/useGame.ts';
import { atDawn, beforeLockedDoor, inHall, nowhereToGo } from '../pages/demo-games.ts';
import type { Game } from '../services/game.ts';
import MoveList from './MoveList.tsx';

function renderList(game: Game, loading = false) {
  const actions = { move: vi.fn() } as unknown as GameActions;
  render(<MoveList game={game} loading={loading} actions={actions} />);
  return actions.move;
}

test('shows one button per adjacent room', () => {
  renderList(atDawn);

  expect(screen.getAllByRole('button')).toHaveLength(2);
  expect(screen.getByRole('button', { name: 'Aller à : Salle commune' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Aller à : Cave' })).toBeInTheDocument();
});

test('marks a locked room with a padlock and a text, and keeps it clickable', () => {
  const move = renderList(beforeLockedDoor);
  const locked = screen.getByRole('button', { name: 'Aller à : Bureau d’Armand (verrouillée)' });

  expect(locked.querySelector('svg')).toBeInTheDocument();
  expect(within(locked).getByText('(verrouillée)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Aller à : Salle commune' }).querySelector('svg')).toBeNull();

  fireEvent.click(locked);
  expect(move).toHaveBeenCalledWith('office');
});

test('asks to move to the clicked room, once', () => {
  const move = renderList({ ...atDawn, status: 'in_progress' });

  fireEvent.click(screen.getByRole('button', { name: 'Aller à : Cave' }));

  expect(move).toHaveBeenCalledTimes(1);
  expect(move).toHaveBeenCalledWith('cellar');
});

test('disables every button during a request', () => {
  const move = renderList(inHall, true);

  for (const button of screen.getAllByRole('button')) {
    expect(button).toBeDisabled();
  }
  fireEvent.click(screen.getByRole('button', { name: 'Aller à : Cuisine' }));
  expect(move).not.toHaveBeenCalled();
});

test('disables every button at dawn', () => {
  renderList(atDawn);

  for (const button of screen.getAllByRole('button')) {
    expect(button).toBeDisabled();
  }
});

test('stays readable without any adjacent room', () => {
  renderList(nowhereToGo);

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('Aucune pièce accessible d’ici.')).toBeInTheDocument();
});
