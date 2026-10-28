import { useState } from 'react';
import InnMap from '../components/InnMap.tsx';
import MoveList from '../components/MoveList.tsx';
import type { GameActions } from '../hooks/useGame.ts';
import type { Game } from '../services/game.ts';
import { atDawn, beforeLockedDoor, inHall, nowhereToGo } from './demo-games.ts';

const cases: { title: string; game: Game; loading: boolean }[] = [
  { title: 'Partie neuve, salle commune', game: inHall, loading: false },
  { title: 'Devant une porte verrouillée', game: beforeLockedDoor, loading: false },
  { title: 'Requête en cours', game: inHall, loading: true },
  { title: 'À l’aube', game: atDawn, loading: false },
  { title: 'Aucune pièce adjacente', game: nowhereToGo, loading: false },
];

const ignore = () => {};

// Dev-only page: the move components fed with simulated games, the requested move is shown instead of sent
export default function DemoScreen() {
  const [requested, setRequested] = useState<string | null>(null);
  const actions: GameActions = {
    newGame: ignore,
    move: (roomId) => setRequested(roomId),
    search: ignore,
    interrogate: ignore,
    accuse: ignore,
    loadSummary: ignore,
  };

  return (
    <div className="min-h-dvh p-3 sm:p-8">
      <main className="mx-auto max-w-6xl border border-rule bg-page px-6 py-10 sm:px-14 sm:py-14">
        <h1 className="text-4xl leading-tight italic sm:text-6xl">Démo : se déplacer</h1>
        <p aria-live="polite" className="mt-4 text-ink-faded">
          {requested ? `Demandé : actions.move("${requested}")` : 'Cliquez sur une pièce : l’appel demandé s’affiche ici.'}
        </p>

        {cases.map(({ title, game, loading }) => (
          <section key={title} aria-label={title} className="mt-12 border-t border-rule pt-8">
            <p className="text-2xl italic">{title}</p>
            <div className="mt-6 grid gap-10">
              <MoveList game={game} loading={loading} actions={actions} />
              <InnMap game={game} loading={loading} actions={actions} />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
