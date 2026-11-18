import { render, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { LogEntry } from '../services/game.ts';
import ActionLog from './ActionLog.tsx';

const threeEntries: LogEntry[] = [
  { version: 1, type: 'movement', result: null, text: 'Vous entrez dans la cuisine.' },
  { version: 2, type: 'search', result: 'success', text: 'Sous l’évier, un flacon vide.' },
  { version: 3, type: 'interrogation', result: 'no_effect', text: 'Marthe hausse les épaules.' },
];

test('lists 3 entries in version order, with readable type and result', () => {
  render(<ActionLog game={{ log: threeEntries }} />);

  expect(screen.getByText('Historique (3 actions)')).toBeInTheDocument();

  const items = within(screen.getByRole('list')).getAllByRole('listitem');
  expect(items).toHaveLength(3);
  expect(items[0]).toHaveTextContent('1.Déplacement');
  expect(items[0]).toHaveTextContent('Vous entrez dans la cuisine.');
  expect(items[1]).toHaveTextContent('2.Fouille — succès');
  expect(items[1]).toHaveTextContent('Sous l’évier, un flacon vide.');
  expect(items[2]).toHaveTextContent('3.Interrogatoire — sans effet');
});

test('shows a result it does not know as received', () => {
  render(<ActionLog game={{ log: [{ version: 4, type: 'search', result: 'locked', text: '…' }] }} />);

  expect(screen.getByRole('listitem')).toHaveTextContent('Fouille — locked');
  expect(screen.getByText('Historique (1 action)')).toBeInTheDocument();
});

test('says there is no action yet when the log is empty', () => {
  render(<ActionLog game={{ log: [] }} />);

  expect(screen.getByText('Historique (0 action)')).toBeInTheDocument();
  expect(screen.getByText('Aucune action pour l’instant.')).toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

test('is a collapsible section whose title is a native summary, usable with the keyboard', () => {
  const { container } = render(<ActionLog game={{ log: threeEntries }} />);

  const details = container.querySelector('details');
  expect(details).not.toBeNull();
  expect(details).not.toHaveAttribute('open');
  expect(details?.querySelector('summary')).toHaveTextContent('Historique (3 actions)');
});