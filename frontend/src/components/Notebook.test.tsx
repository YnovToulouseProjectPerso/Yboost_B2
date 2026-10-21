import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { Game, NotebookClue } from '../services/game.ts';
import Notebook from './Notebook.tsx';

const clues: NotebookClue[] = [
  { id: 'i_a1', title: 'Indice A1', text: 'Premier indice.', source: 'search', location: 'Pièce A' },
  { id: 'i_b1', title: 'Indice B1', text: 'Deuxième indice.', source: 'search', location: 'Pièce B' },
  { id: 't_s1_base', title: 'Déclaration de S1', text: 'Un témoignage.', source: 'interrogation', location: 'Pièce A' },
];

function createGame(notebook: NotebookClue[]): Game {
  return {
    gameId: 'p_test',
    seed: 42,
    version: 3,
    status: 'in_progress',
    remainingActions: 9,
    time: '2h30',
    currentRoom: { id: 'a', name: 'Pièce A', description: '…', fullySearched: false },
    adjacentRooms: [{ id: 'b', name: 'Pièce B', locked: false }],
    presentSuspects: [{ id: 's1', name: 'Suspect Un', role: '…' }],
    notebook,
    items: [],
    lastEvent: { type: 'search', result: 'success', text: 'Vous trouvez…' },
    suspects: [{ id: 's1', name: 'Suspect Un', role: '…' }],
    log: [],
  };
}

const entries = () => within(screen.getByRole('list')).getAllByRole('listitem');

describe('Notebook', () => {
  test('lists the clues in the order received, with their origin in text', () => {
    render(<Notebook game={createGame(clues)} />);

    expect(entries().map((entry) => within(entry).getByRole('heading').textContent)).toEqual([
      'Indice A1',
      'Indice B1',
      'Déclaration de S1',
    ]);
    expect(entries()[0]).toHaveTextContent('Trouvé en fouillant : Pièce A');
    expect(entries()[2]).toHaveTextContent('Témoignage');
  });

  test('shows a help message when the notebook is empty', () => {
    render(<Notebook game={createGame([])} />);

    expect(
      screen.getByText('Votre carnet est vide. Fouillez ou interrogez pour trouver des indices.'),
    ).toBeInTheDocument();
  });

  test('marks only the clue added since the previous display as new', () => {
    const { rerender } = render(<Notebook game={createGame(clues.slice(0, 2))} />);
    expect(screen.queryByText('Nouveau')).not.toBeInTheDocument();

    rerender(<Notebook game={createGame(clues)} />);

    expect(screen.getAllByText('Nouveau')).toHaveLength(1);
    expect(entries()[2]).toHaveTextContent('Nouveau');
  });

  test('shows HTML in a clue as plain text', () => {
    const clue = { ...clues[0], text: '<b>Gras</b>' };

    render(<Notebook game={createGame([clue])} />);

    expect(screen.getByText('<b>Gras</b>')).toBeInTheDocument();
  });
});
