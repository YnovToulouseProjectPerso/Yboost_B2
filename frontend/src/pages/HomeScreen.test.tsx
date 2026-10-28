import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import HomeScreen from './HomeScreen.tsx';

const button = () => screen.getByRole('button', { name: 'Nouvelle enquête' });
const seedInput = () => screen.getByLabelText('Graine (facultative)');
const seedError = 'La graine doit être un entier strictement positif, ou rester vide.';

describe('HomeScreen', () => {
  test('shows the title, the pitch and the rules', () => {
    render(<HomeScreen loading={false} onNewGame={() => {}} />);

    expect(screen.getByRole('heading', { level: 1, name: 'La Dernière Auberge' })).toBeInTheDocument();
    expect(screen.getByText(/12 actions avant l’aube/)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  test('starts a game without argument when no seed is given', () => {
    const onNewGame = vi.fn();
    render(<HomeScreen loading={false} onNewGame={onNewGame} />);

    fireEvent.click(button());

    expect(onNewGame).toHaveBeenCalledTimes(1);
    expect(onNewGame).toHaveBeenCalledWith();
  });

  test('starts a game with the seed as a number', () => {
    const onNewGame = vi.fn();
    render(<HomeScreen loading={false} onNewGame={onNewGame} />);

    fireEvent.change(seedInput(), { target: { value: '421337' } });
    fireEvent.click(button());

    expect(onNewGame).toHaveBeenCalledTimes(1);
    expect(onNewGame).toHaveBeenCalledWith(421337);
  });

  test.each(['abc', '0', '-5'])('disables the button and explains an invalid seed: %s', (value) => {
    const onNewGame = vi.fn();
    render(<HomeScreen loading={false} onNewGame={onNewGame} />);

    fireEvent.change(seedInput(), { target: { value } });

    expect(button()).toBeDisabled();
    expect(screen.getByText(seedError)).toBeInTheDocument();
    expect(seedInput()).toHaveAccessibleDescription(seedError);

    fireEvent.submit(button());
    expect(onNewGame).not.toHaveBeenCalled();
  });

  test('disables the button while loading', () => {
    render(<HomeScreen loading onNewGame={() => {}} />);

    expect(button()).toBeDisabled();
    expect(button()).toHaveAttribute('aria-busy', 'true');
    expect(button()).toHaveTextContent('…');
  });

  test('shows the message only when one is given', () => {
    const message = 'Cette partie n’existe plus : le serveur a redémarré.';
    const { rerender } = render(<HomeScreen loading={false} onNewGame={() => {}} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<HomeScreen loading={false} message={message} onNewGame={() => {}} />);

    expect(screen.getByRole('status')).toHaveTextContent(message);
  });

  test('can be used with the keyboard: the seed field then the button, Enter submits', () => {
    const onNewGame = vi.fn();
    render(<HomeScreen loading={false} onNewGame={onNewGame} />);

    const focusable = [...document.querySelectorAll('input, button')];
    expect(focusable).toEqual([seedInput(), button()]);

    seedInput().focus();
    fireEvent.change(seedInput(), { target: { value: '7' } });
    fireEvent.submit(seedInput());

    expect(onNewGame).toHaveBeenCalledWith(7);
  });
});
