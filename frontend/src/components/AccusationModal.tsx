import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { GameActions } from '../hooks/useGame.ts';
import type { Game } from '../services/game.ts';

type Props = {
  game: Game;
  loading: boolean;
  actions: GameActions;
  onClose: () => void;
};

const EVIDENCE_COUNT = 2;

// The interface only prevents obviously invalid input: the server decides the outcome
export default function AccusationModal({ game, loading, actions, onClose }: Props) {
  const [suspectId, setSuspectId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus goes into the modal on opening and back to the opening button on closing
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLElement>('input:not(:disabled), button:not(:disabled)')?.focus();
    return () => opener?.focus();
  }, []);

  const canAccuse = !loading && suspectId !== null && evidence.length === EVIDENCE_COUNT;

  function toggleClue(clueId: string) {
    setEvidence((chosen) => (chosen.includes(clueId) ? chosen.filter((id) => id !== clueId) : [...chosen, clueId]));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-leather/80 p-3 sm:p-8">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accusation-title"
        aria-describedby="accusation-warning"
        onKeyDown={handleKeyDown}
        className="max-h-full w-full max-w-2xl overflow-y-auto border border-rule bg-page px-6 py-8 sm:px-10"
      >
        <h2 id="accusation-title" className="text-3xl italic">
          Accuser
        </h2>
        <p id="accusation-warning" className="mt-3 text-ink-faded">
          L’accusation met fin à l’enquête. Désignez un suspect et choisissez 2 indices de votre carnet.
        </p>

        <fieldset className="mt-8" disabled={loading}>
          <legend className="tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">Suspect</legend>
          <ul className="mt-3 space-y-2">
            {game.suspects.map((suspect) => (
              <li key={suspect.id}>
                <label className="flex items-baseline gap-3">
                  <input
                    type="radio"
                    name="suspect"
                    value={suspect.id}
                    checked={suspectId === suspect.id}
                    onChange={() => setSuspectId(suspect.id)}
                  />
                  <span>
                    {suspect.name} <span className="text-ink-faded">— {suspect.role}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="mt-8" disabled={loading}>
          <legend className="tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">Indices</legend>
          {game.notebook.length === 0 ? (
            <p className="mt-3 text-ink-faded">Votre carnet est vide.</p>
          ) : (
            <>
              <p className="mt-3" aria-live="polite">
                Indices choisis : {evidence.length} / {EVIDENCE_COUNT}
              </p>
              <ul className="mt-3 space-y-2">
                {game.notebook.map((clue) => {
                  const checked = evidence.includes(clue.id);
                  return (
                    <li key={clue.id}>
                      <label className="flex items-baseline gap-3">
                        <input
                          type="checkbox"
                          value={clue.id}
                          checked={checked}
                          disabled={!checked && evidence.length >= EVIDENCE_COUNT}
                          onChange={() => toggleClue(clue.id)}
                        />
                        <span>{clue.title}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </fieldset>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            disabled={!canAccuse}
            aria-busy={loading}
            onClick={() => suspectId && actions.accuse(suspectId, evidence)}
            className="border border-oxblood bg-oxblood px-6 py-3 text-lg text-ink transition-[background-color,transform] duration-150 ease-out enabled:hover:bg-oxblood-lit enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:active:scale-100"
          >
            Accuser
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="border border-rule px-6 py-3 text-lg text-ink transition-[border-color,transform] duration-150 ease-out enabled:hover:border-ink-faded enabled:active:scale-[0.97] disabled:opacity-70 motion-reduce:active:scale-100"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
