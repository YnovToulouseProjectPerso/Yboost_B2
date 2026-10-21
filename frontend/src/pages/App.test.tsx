import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App.tsx';

test('opens on the home screen', () => {
  render(<App />);

  expect(screen.getByRole('heading', { level: 1, name: 'La Dernière Auberge' })).toBeInTheDocument();
});

test('starts an investigation from the home screen', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Nouvelle enquête' }));

  expect(screen.getByRole('heading', { level: 1, name: 'L’enquête' })).toHaveFocus();
});
