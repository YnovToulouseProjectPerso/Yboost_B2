import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { atDawn } from '../pages/demo-games.ts';
import type { GameStatus } from '../services/game.ts';
import DawnBanner from './DawnBanner.tsx';

test('shows the last chance banner at dawn, with a readable text and a decorative icon', () => {
  render(<DawnBanner game={atDawn} />);

  const banner = screen.getByRole('status');
  expect(banner).toHaveTextContent('L’aube se lève : dernière chance. Seule l’accusation est encore possible.');
  expect(banner.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

test.each<GameStatus>(['in_progress', 'victory', 'defeat'])('shows nothing when the game is %s', (status) => {
  const { container } = render(<DawnBanner game={{ ...atDawn, status }} />);

  expect(screen.queryByRole('status')).toBeNull();
  expect(container).toBeEmptyDOMElement();
});
