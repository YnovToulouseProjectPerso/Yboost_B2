import { useState } from 'react';
import type { Game, NotebookClue } from '../services/game.ts';

export default function Notebook({ game }: { game: Game }) {
  // Clues absent from the previous display get the "Nouveau" mark (interface state, not a game rule)
  const [shown, setShown] = useState(game.notebook);
  const [newIds, setNewIds] = useState<string[]>([]);

  if (game.notebook !== shown) {
    const before = new Set(shown.map((clue) => clue.id));
    setShown(game.notebook);
    setNewIds(game.notebook.filter((clue) => !before.has(clue.id)).map((clue) => clue.id));
  }

  return (
    <section aria-labelledby="notebook-title">
      <h2 id="notebook-title" className="tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">
        Carnet
      </h2>

      {game.notebook.length === 0 ? (
        <p className="mt-3 text-ink-faded">Votre carnet est vide. Fouillez ou interrogez pour trouver des indices.</p>
      ) : (
        <ol className="mt-3 border-t border-rule">
          {game.notebook.map((clue) => (
            <Entry key={clue.id} clue={clue} isNew={newIds.includes(clue.id)} />
          ))}
        </ol>
      )}
    </section>
  );
}

function Entry({ clue, isNew }: { clue: NotebookClue; isNew: boolean }) {
  return (
    <li
      className={`border-b border-rule py-4 ${
        isNew
          ? 'transition-[opacity,filter] duration-200 ease-out starting:opacity-0 starting:blur-[2px] motion-reduce:starting:blur-none'
          : ''
      }`}
    >
      <h3 className="flex flex-wrap items-baseline gap-x-3 text-lg italic">
        {clue.title}
        {isNew && (
          <span className="text-base tracking-[0.12em] text-gilt not-italic [font-variant-caps:all-small-caps]">
            Nouveau
          </span>
        )}
      </h3>
      <p className="mt-1 max-w-[65ch]">{clue.text}</p>
      <p className="mt-1 text-sm text-ink-faded">
        {clue.source === 'search' ? `Trouvé en fouillant : ${clue.location}` : 'Témoignage'}
      </p>
    </li>
  );
}
