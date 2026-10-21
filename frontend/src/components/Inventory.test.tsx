import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { Game } from '../services/game.ts';
import Inventory from './Inventory.tsx';

// Inventory only reads `items`
const withItems = (items: Game['items']) => ({ items }) as Game;

test('says when the player has no item', () => {
  render(<Inventory game={withItems([])} />);

  expect(screen.getByText('Aucun objet')).toBeInTheDocument();
});

test('lists the items owned by the player', () => {
  render(<Inventory game={withItems([{ id: 'key_c', name: 'Clé de C' }])} />);

  expect(screen.getByRole('listitem')).toHaveTextContent('Clé de C');
  expect(screen.queryByText('Aucun objet')).not.toBeInTheDocument();
});
