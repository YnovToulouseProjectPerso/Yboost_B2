import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { Game, Summary } from '../services/game.ts';
import EndScreen from './EndScreen.tsx';

// Invented data in the contract format, never the real scenario solution
function createGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: 'p_test',
    seed: 421337,
    version: 9,
    status: 'victory',
    remainingActions: 3,
    time: '5h00',
    currentRoom: { id: 'a', name: 'Pièce A', description: '…', fullySearched: false },
    adjacentRooms: [],
    presentSuspects: [],
    notebook: [
      { id: 'c1', title: 'Gant taché', text: '…', source: 'search', location: 'Pièce A' },
      { id: 'c2', title: 'Lettre déchirée', text: '…', source: 'search', location: 'Pièce B' },
      { id: 'c3', title: 'Bougie éteinte', text: '…', source: 'search', location: 'Pièce C' },
    ],
    items: [],
    lastEvent: { type: 'accusation', result: 'victory', text: 'Vos preuves sont accablantes.' },
    suspects: [
      { id: 'x', name: 'Suspect X', role: 'Colporteur' },
      { id: 'y', name: 'Suspect Y', role: 'Cocher' },
    ],
    log: [],
    ...overrides,
  };
}

function createSummary(accusation: Summary['accusation']): Summary {
  return {
    culprit: { id: 'x', name: 'Suspect X' },
    motive: 'Une vieille dette de jeu.',
    timeline: [
      { time: '23h00', text: 'X monte à l’étage.' },
      { time: '0h30', text: 'Un bruit sourd dans le bureau.' },
    ],
    possibleEvidence: [
      { id: 'c1', title: 'Gant taché', obtained: true },
      { id: 'c2', title: 'Lettre déchirée', obtained: true },
      { id: 'c4', title: 'Clé tordue', obtained: false },
    ],
    accusation,
  };
}

const victory = createGame();
const victorySummary = createSummary({ suspectId: 'x', evidence: ['c1', 'c2'], correct: true });
const defeat = createGame({
  status: 'defeat',
  lastEvent: { type: 'accusation', result: 'defeat', text: 'Votre accusation ne tient pas.' },
});
const defeatSummary = createSummary({ suspectId: 'y', evidence: ['c1', 'c3'], correct: false });

function setup({ game = victory, summary = victorySummary as Summary | null, loading = false, error = null as string | null } = {}) {
  const onReplay = vi.fn();
  const onReplaySameGame = vi.fn();
  render(
    <EndScreen
      game={game}
      summary={summary}
      loading={loading}
      error={error}
      onReplay={onReplay}
      onReplaySameGame={onReplaySameGame}
    />,
  );
  return { onReplay, onReplaySameGame };
}

const section = (name: string) => screen.getByRole('region', { name });

describe('EndScreen', () => {
  test('shows the victory, the last event and the full summary', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Victoire' })).toBeInTheDocument();
    expect(screen.getByText('Vos preuves sont accablantes.')).toBeInTheDocument();
    expect(section('Le coupable')).toHaveTextContent('Suspect X');
    expect(section('Le coupable')).toHaveTextContent('Mobile : Une vieille dette de jeu.');

    const moments = within(section('La nuit')).getAllByRole('listitem');
    expect(moments.map((moment) => moment.textContent)).toEqual([
      '23h00 — X monte à l’étage.',
      '0h30 — Un bruit sourd dans le bureau.',
    ]);

    expect(section('Votre accusation')).toHaveTextContent('Suspect accusé : Suspect X');
    expect(section('Votre accusation')).toHaveTextContent('Accusation correcte');
    expect(screen.getByText(/^Graine :/)).toHaveTextContent('Graine : 421337');
  });

  test('shows the defeat with the real culprit and the accusation marked incorrect', () => {
    setup({ game: defeat, summary: defeatSummary });

    expect(screen.getByRole('heading', { level: 1, name: 'Défaite' })).toBeInTheDocument();
    expect(screen.getByText('Votre accusation ne tient pas.')).toBeInTheDocument();
    expect(section('Le coupable')).toHaveTextContent('Suspect X');

    const accusation = section('Votre accusation');
    expect(accusation).toHaveTextContent('Suspect accusé : Suspect Y');
    expect(within(accusation).getAllByRole('listitem').map((clue) => clue.textContent)).toEqual([
      'Gant taché',
      'Bougie éteinte',
    ]);
    expect(accusation).toHaveTextContent('Accusation incorrecte');
  });

  test('says for every possible evidence whether it was obtained, in words', () => {
    setup();

    const clues = within(section('Les preuves possibles')).getAllByRole('listitem');
    expect(clues.map((clue) => clue.textContent)).toEqual([
      'Gant taché — obtenue',
      'Lettre déchirée — obtenue',
      'Clé tordue — non trouvée',
    ]);
  });

  test('shows a loading indicator until the summary arrives', () => {
    setup({ summary: null });

    expect(screen.getByRole('status')).toHaveTextContent('Chargement du récapitulatif…');
    expect(screen.queryByRole('region', { name: 'Le coupable' })).not.toBeInTheDocument();
  });

  test('shows a technical error, distinct from the game event', () => {
    setup({ summary: null, error: 'Le serveur ne répond pas.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Le serveur ne répond pas.');
    expect(screen.getByText('Vos preuves sont accablantes.')).not.toHaveAttribute('role');
  });

  test('“Rejouer” starts a new game', () => {
    const { onReplay, onReplaySameGame } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Rejouer' }));

    expect(onReplay).toHaveBeenCalledTimes(1);
    expect(onReplay).toHaveBeenCalledWith();
    expect(onReplaySameGame).not.toHaveBeenCalled();
  });

  test('“Rejouer la même partie” replays with the seed of the game', () => {
    const { onReplay, onReplaySameGame } = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Rejouer la même partie' }));

    expect(onReplaySameGame).toHaveBeenCalledTimes(1);
    expect(onReplaySameGame).toHaveBeenCalledWith(421337);
    expect(onReplay).not.toHaveBeenCalled();
  });

  test('disables both buttons while loading', () => {
    setup({ loading: true });

    expect(screen.getByRole('button', { name: 'Rejouer' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rejouer la même partie' })).toBeDisabled();
  });

  test('puts the focus on the title, then the buttons are reachable with the keyboard', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
    expect([...document.querySelectorAll('button')].map((button) => button.textContent)).toEqual([
      'Rejouer',
      'Rejouer la même partie',
    ]);
  });
});