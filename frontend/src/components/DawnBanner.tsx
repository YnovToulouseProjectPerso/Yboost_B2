import type { Game } from '../services/game.ts';

// Shown only at dawn: the player has no action left but can still accuse
export default function DawnBanner({ game }: { game: Pick<Game, 'status'> }) {
  if (game.status !== 'dawn') return null;

  return (
    <div role="status" className="mb-10 flex items-start gap-4 border border-gilt px-5 py-4 text-ink">
      <Sunrise />
      <p className="max-w-[65ch]">
        <strong className="font-semibold">L’aube se lève : dernière chance.</strong> Seule l’accusation est encore
        possible.
      </p>
    </div>
  );
}

function Sunrise() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="mt-1 size-6 shrink-0 text-gilt"
    >
      <path d="M2 18h20M5 21h14M7 18a5 5 0 0 1 10 0M12 4v3M4.9 9.9l2.1 2.1M19.1 9.9 17 12M2 14h2M20 14h2" />
    </svg>
  );
}
