import DawnBanner from '../components/DawnBanner.tsx';
import { isActionAllowed, type ActionType } from '../services/action-rules.ts';
import type { GameStatus } from '../services/game.ts';

const statuses: { status: GameStatus; loading: boolean; title: string }[] = [
  { status: 'in_progress', loading: false, title: 'En cours' },
  { status: 'dawn', loading: false, title: 'À l’aube (7h00, 0 action)' },
  { status: 'dawn', loading: true, title: 'À l’aube, requête en cours' },
  { status: 'victory', loading: false, title: 'Victoire' },
  { status: 'defeat', loading: false, title: 'Défaite' },
];

const actions: { type: ActionType; label: string }[] = [
  { type: 'move', label: 'Se déplacer' },
  { type: 'search', label: 'Fouiller' },
  { type: 'interrogate', label: 'Interroger' },
  { type: 'accuse', label: 'Accuser' },
];

// Dev-only: the dawn banner and the shared activation rule, until the game screen wiring (#35)
export default function DawnDemo() {
  return (
    <>
      {statuses.map(({ status, loading, title }) => (
        <section key={title} aria-label={title} className="mt-12 border-t border-rule pt-8">
          <p className="text-2xl italic">{title}</p>
          <div className="mt-6">
            <DawnBanner game={{ status }} />
            <ul className="flex flex-wrap gap-3">
              {actions.map(({ type, label }) => (
                <li key={type}>
                  <button
                    type="button"
                    disabled={!isActionAllowed({ status }, loading, type)}
                    className="border border-rule px-6 py-3 text-lg text-ink enabled:hover:border-ink-faded disabled:cursor-not-allowed disabled:text-ink-faded disabled:opacity-60"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
