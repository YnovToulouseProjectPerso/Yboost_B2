import type { Clue } from '../types/game.ts';

interface InventoryProps {
  clues: Clue[];
  selectedClueId: string | null;
  onSelect: (clueId: string | null) => void;
}

// List of the clues the player owns.
// Clicking a clue selects it so it can be shown to a suspect during an
// interrogation. Clicking it again clears the selection.
export default function Inventory({ clues, selectedClueId, onSelect }: InventoryProps) {
  function toggleSelection(clueId: string) {
    onSelect(selectedClueId === clueId ? null : clueId);
  }

  return (
    <section
      aria-labelledby="inventory-title"
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="inventory-title"
          className="text-sm font-semibold uppercase tracking-wider text-slate-300"
        >
          Inventaire
        </h2>
        <span className="text-sm text-slate-300">
          {clues.length} indice{clues.length > 1 ? 's' : ''}
        </span>
      </div>

      {clues.length === 0 ? (
        <p className="text-sm text-slate-300">
          Aucun indice pour l'instant. Fouillez les pièces pour en trouver.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {clues.map((clue) => {
            const isSelected = clue.id === selectedClueId;

            return (
              <li key={clue.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleSelection(clue.id)}
                  className={`flex w-full flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-50">{clue.name}</span>
                    {isSelected && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                        Sélectionné
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-slate-300">{clue.description}</span>
                  <span className="text-xs text-slate-400">Trouvé : {clue.location}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
