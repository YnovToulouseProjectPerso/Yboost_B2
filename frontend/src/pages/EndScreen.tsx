import type { Game, Summary } from '../services/game.ts';

type Props = {
  game: Game;
  summary: Summary | null;
  loading: boolean;
  error: string | null;
  onReplay: () => void;
  onReplaySameGame: (seed: number) => void;
};

const focusTitle = (title: HTMLHeadingElement | null) => title?.focus();

const sectionTitle = 'tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]';
const button =
  'border px-6 py-3 text-lg text-ink transition-[background-color,border-color,transform] duration-150 ease-out enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:enabled:active:scale-100';

// End of the investigation: outcome, full summary (the solution is always revealed) and replay buttons
export default function EndScreen({ game, summary, loading, error, onReplay, onReplaySameGame }: Props) {
  const won = game.status === 'victory';

  return (
    <section aria-labelledby="end-title">
      <h1
        id="end-title"
        tabIndex={-1}
        ref={focusTitle}
        className="flex items-center gap-4 text-4xl leading-tight italic outline-none sm:text-6xl"
      >
        {won ? <VictoryIcon /> : <DefeatIcon />}
        {won ? 'Victoire' : 'Défaite'}
      </h1>
      <p className="mt-6 max-w-[65ch] text-lg">{game.lastEvent.text}</p>

      <div className="mt-12">
        {error ? (
          <p role="alert" className="max-w-[65ch] border border-rule px-5 py-4">
            Le récapitulatif n’a pas pu être chargé : {error}
          </p>
        ) : summary ? (
          <Recap game={game} summary={summary} />
        ) : (
          <p role="status" className="text-ink-faded">
            Chargement du récapitulatif…
          </p>
        )}
      </div>

      <p className="mt-12 text-ink-faded">
        Graine : <span className="text-ink tabular-nums">{game.seed}</span>
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={() => onReplay()}
          className={`${button} border-oxblood bg-oxblood enabled:hover:bg-oxblood-lit`}
        >
          Rejouer
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onReplaySameGame(game.seed)}
          className={`${button} border-rule enabled:hover:border-ink-faded`}
        >
          Rejouer la même partie
        </button>
      </div>
    </section>
  );
}

function Recap({ game, summary }: { game: Game; summary: Summary }) {
  const { accusation } = summary;
  const accusedName = game.suspects.find((suspect) => suspect.id === accusation.suspectId)?.name ?? accusation.suspectId;
  const clueTitle = (id: string) =>
    game.notebook.find((clue) => clue.id === id)?.title ??
    summary.possibleEvidence.find((clue) => clue.id === id)?.title ??
    id;

  return (
    <div className="grid gap-10">
      <section aria-labelledby="recap-culprit">
        <h2 id="recap-culprit" className={sectionTitle}>
          Le coupable
        </h2>
        <p className="mt-2 text-2xl italic">{summary.culprit.name}</p>
        <p className="mt-2 max-w-[65ch]">
          <span className="text-ink-faded">Mobile : </span>
          {summary.motive}
        </p>
      </section>

      <section aria-labelledby="recap-timeline">
        <h2 id="recap-timeline" className={sectionTitle}>
          La nuit
        </h2>
        <ol className="mt-3 max-w-[65ch] space-y-2">
          {summary.timeline.map((moment) => (
            <li key={`${moment.time}-${moment.text}`}>
              <span className="tabular-nums text-ink-faded">{moment.time}</span> — {moment.text}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="recap-evidence">
        <h2 id="recap-evidence" className={sectionTitle}>
          Les preuves possibles
        </h2>
        <ul className="mt-3 space-y-2">
          {summary.possibleEvidence.map((clue) => (
            <li key={clue.id} className="flex items-baseline gap-3">
              {clue.obtained ? <CheckIcon /> : <CrossIcon />}
              <span>
                {clue.title} <span className="text-ink-faded">— {clue.obtained ? 'obtenue' : 'non trouvée'}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recap-accusation">
        <h2 id="recap-accusation" className={sectionTitle}>
          Votre accusation
        </h2>
        <p className="mt-2">
          Suspect accusé : <strong className="font-semibold">{accusedName}</strong>
        </p>
        <ul className="mt-2 list-disc pl-6">
          {accusation.evidence.map((id) => (
            <li key={id}>{clueTitle(id)}</li>
          ))}
        </ul>
        <p className="mt-2 flex items-baseline gap-3">
          {accusation.correct ? <CheckIcon /> : <CrossIcon />}
          Accusation {accusation.correct ? 'correcte' : 'incorrecte'}
        </p>
      </section>
    </div>
  );
}

const iconProps = {
  'aria-hidden': true,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function VictoryIcon() {
  return (
    <svg {...iconProps} className="size-10 shrink-0 text-gilt sm:size-14">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
    </svg>
  );
}

function DefeatIcon() {
  return (
    <svg {...iconProps} className="size-10 shrink-0 text-oxblood-lit sm:size-14">
      <path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v4M9 13l6 0" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...iconProps} className="size-4 shrink-0 translate-y-0.5 text-gilt">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg {...iconProps} className="size-4 shrink-0 translate-y-0.5 text-ink-faded">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}