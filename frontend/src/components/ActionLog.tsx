import type { EventType, Game } from '../services/game.ts';

type Props = { game: Pick<Game, 'log'> };

const typeLabels: Record<EventType, string> = {
  introduction: 'Début de l’enquête',
  movement: 'Déplacement',
  search: 'Fouille',
  interrogation: 'Interrogatoire',
  accusation: 'Accusation',
  dawn: 'Aube',
};

// Known results in plain words; any other value is shown as received
const resultLabels: Record<string, string> = {
  success: 'succès',
  failure: 'rien trouvé',
  nothing: 'rien trouvé',
  no_effect: 'sans effet',
  revelation: 'révélation',
  contradiction: 'contradiction',
  victory: 'victoire',
  defeat: 'défaite',
};

// History of the accepted actions, shown exactly as the server sends it: no computation, no "evidence" mark
export default function ActionLog({ game }: Props) {
  // The server opens every log with the introduction (version 0): it is not an action of the player
  const actions = game.log.filter((entry) => entry.type !== 'introduction');
  const count = actions.length;

  return (
    <details className="group border-t border-rule pt-6">
      <summary className="cursor-pointer tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">
        Historique ({count} {count > 1 ? 'actions' : 'action'})
      </summary>

      {count === 0 ? (
        <p className="mt-3 text-ink-faded">Aucune action pour l’instant.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {actions.map((entry) => (
            <li key={entry.version} className="grid grid-cols-[3ch_1fr] gap-x-3">
              <span className="text-right text-ink-faded tabular-nums">{entry.version}.</span>
              <div>
                <p>
                  <strong className="font-semibold">{typeLabels[entry.type] ?? entry.type}</strong>
                  {entry.result !== null && (
                    <span className="text-ink-faded"> — {resultLabels[entry.result] ?? entry.result}</span>
                  )}
                </p>
                <p className="text-ink-faded">{entry.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </details>
  );
}