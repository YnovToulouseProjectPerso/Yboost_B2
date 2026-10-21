import { useId, useState } from 'react';
import type { NotebookEntry, NotebookEntryType } from '../types/game.ts';

interface NotebookProps {
  entries: NotebookEntry[];
}

const entryTypeLabels: Record<NotebookEntryType, { label: string; classes: string }> = {
  testimony: {
    label: 'Témoignage',
    classes: 'border-slate-400/40 text-slate-200',
  },
  revelation: {
    label: 'Révélation',
    classes: 'border-amber-400/60 text-amber-300',
  },
  no_effect: {
    label: 'Sans effet',
    classes: 'border-slate-500/40 text-slate-400',
  },
};

const ALL_SUSPECTS = 'all';

// Investigation notebook: every testimony obtained during interrogations,
// newest first, with a filter by suspect.
export default function Notebook({ entries }: NotebookProps) {
  const [suspectFilter, setSuspectFilter] = useState(ALL_SUSPECTS);
  const filterId = useId();

  const suspects = [
    ...new Map(entries.map((entry) => [entry.suspectId, entry.suspectName])),
  ];

  const visibleEntries = entries
    .filter(
      (entry) => suspectFilter === ALL_SUSPECTS || entry.suspectId === suspectFilter,
    )
    .reverse();

  return (
    <section
      aria-labelledby="notebook-title"
      className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="notebook-title"
          className="text-sm font-semibold uppercase tracking-wider text-slate-300"
        >
          Carnet d'enquête
        </h2>

        {suspects.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor={filterId} className="text-sm text-slate-300">
              Suspect
            </label>
            <select
              id={filterId}
              value={suspectFilter}
              onChange={(event) => setSuspectFilter(event.target.value)}
              className="min-h-11 rounded-lg border border-white/15 bg-slate-900 px-3 text-sm text-slate-50 focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <option value={ALL_SUSPECTS}>Tous</option>
              {suspects.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {visibleEntries.length === 0 ? (
        <p className="text-sm text-slate-300">
          Le carnet est vide. Interrogez un suspect pour noter son témoignage.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {visibleEntries.map((entry) => {
            const entryType = entryTypeLabels[entry.type];

            return (
              <li
                key={entry.id}
                className="flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-50">{entry.suspectName}</span>
                  <span className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${entryType.classes}`}
                    >
                      {entryType.label}
                    </span>
                    <time className="font-mono text-sm text-slate-400">{entry.time}</time>
                  </span>
                </div>
                <p className="text-slate-200">{entry.text}</p>
                {entry.clueName && (
                  <p className="text-sm text-slate-400">Indice présenté : {entry.clueName}</p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
