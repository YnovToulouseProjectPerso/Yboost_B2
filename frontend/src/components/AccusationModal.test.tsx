import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import type { GameActions } from '../hooks/useGame.ts';
import type { Game, NotebookClue } from '../services/game.ts';
import AccusationModal from './AccusationModal.tsx';

const clues: NotebookClue[] = [
  { id: 'i_a1', title: 'Indice A1', text: '…', source: 'search', location: 'Pièce A' },
  { id: 'i_b1', title: 'Indice B1', text: '…', source: 'search', location: 'Pièce B' },
  { id: 'i_c1', title: 'Indice C1', text: '…', source: 'search', location: 'Pièce C' },
  { id: 'i_d1', title: 'Indice D1', text: '…', source: 'search', location: 'Pièce D' },
  { id: 't_s1_base', title: 'Déclaration de S1', text: '…', source: 'interrogation', location: 'Pièce A' },
];

function createGame(notebook: NotebookClue[]): Game {
  return {
    gameId: 'p_test',
    seed: 42,
    version: 7,
    status: 'in_progress',
    remainingActions: 5,
    time: '4h30',
    currentRoom: { id: 'a', name: 'Pièce A', description: '…', fullySearched: false },
    adjacentRooms: [],
    presentSuspects: [],
    notebook,
    items: [],
    lastEvent: { type: 'search', result: 'success', text: '…' },
    suspects: [
      { id: 's1', name: 'Suspect Un', role: 'Marchand' },
      { id: 's2', name: 'Suspect Deux', role: 'Servante' },
    ],
    log: [],
  };
}

function createActions(): GameActions {
  return { newGame: vi.fn(), move: vi.fn(), search: vi.fn(), interrogate: vi.fn(), accuse: vi.fn(), loadSummary: vi.fn() };
}

function setup({ notebook = clues, loading = false } = {}) {
  const actions = createActions();
  const onClose = vi.fn();
  render(<AccusationModal game={createGame(notebook)} loading={loading} actions={actions} onClose={onClose} />);
  return { actions, onClose };
}

const accuseButton = () => screen.getByRole('button', { name: 'Accuser' });
const check = (label: string) => fireEvent.click(screen.getByLabelText(label));

describe('AccusationModal', () => {
  test('is a dialog named by its title, with the warning', () => {
    setup();

    expect(screen.getByRole('dialog', { name: 'Accuser' })).toHaveAccessibleDescription(/L’accusation met fin à l’enquête/);
  });

  test.each([
    ['nothing chosen', [], false],
    ['no suspect and 2 clues', ['Indice A1', 'Indice B1'], false],
    ['a suspect and no clue', ['Suspect Un — Marchand'], false],
    ['a suspect and 1 clue', ['Suspect Un — Marchand', 'Indice A1'], false],
  ])('disables "Accuser" with %s', (_label, labels) => {
    setup();

    labels.forEach(check);

    expect(accuseButton()).toBeDisabled();
  });

  test('accuses with the chosen suspect and the 2 clue ids, once', () => {
    const { actions, onClose } = setup();

    check('Suspect Deux — Servante');
    check('Indice B1');
    check('Déclaration de S1');
    expect(screen.getByText('Indices choisis : 2 / 2')).toBeInTheDocument();
    fireEvent.click(accuseButton());

    expect(actions.accuse).toHaveBeenCalledTimes(1);
    expect(actions.accuse).toHaveBeenCalledWith('s2', ['i_b1', 't_s1_base']);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('prevents a 3rd clue once 2 are checked, until one is unchecked', () => {
    setup();

    check('Indice A1');
    check('Indice B1');

    expect(screen.getByLabelText('Indice C1')).toBeDisabled();
    expect(screen.getByLabelText('Indice A1')).toBeEnabled();

    check('Indice A1');
    expect(screen.getByLabelText('Indice C1')).toBeEnabled();
    expect(screen.getByText('Indices choisis : 1 / 2')).toBeInTheDocument();
  });

  test('shows every clue the same way, without any "preuve" mark', () => {
    setup();

    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(screen.queryByText(/preuve/i)).not.toBeInTheDocument();
  });

  test.each([[[]], [clues.slice(0, 1)]])('cannot accuse with a notebook of %j', (notebook) => {
    setup({ notebook });

    check('Suspect Un — Marchand');
    if (notebook.length) check('Indice A1');

    expect(accuseButton()).toBeDisabled();
  });

  test('says the notebook is empty', () => {
    setup({ notebook: [] });

    expect(screen.getByText('Votre carnet est vide.')).toBeInTheDocument();
    expect(accuseButton()).toBeDisabled();
  });

  test.each([
    ['"Annuler"', () => fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))],
    ['Escape', () => fireEvent.keyDown(screen.getByLabelText('Indice A1'), { key: 'Escape' })],
  ])('closes with %s without accusing', (_label, close) => {
    const { actions, onClose } = setup();

    close();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(actions.accuse).not.toHaveBeenCalled();
  });

  test('disables every button and input while loading', () => {
    setup({ loading: true });

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    expect(screen.getAllByRole('radio')[0]).toBeDisabled();
  });

  test('moves the focus into the modal and gives it back to the opening button', () => {
    function Screen() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Ouvrir
          </button>
          {open && <AccusationModal game={createGame(clues)} loading={false} actions={createActions()} onClose={() => setOpen(false)} />}
        </>
      );
    }
    render(<Screen />);
    const opener = screen.getByRole('button', { name: 'Ouvrir' });
    opener.focus();

    fireEvent.click(opener);
    expect(screen.getByLabelText('Suspect Un — Marchand')).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
