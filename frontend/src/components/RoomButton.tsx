import type { Game } from '../services/game.ts';

type Props = {
  room: Game['adjacentRooms'][number];
  disabled: boolean;
  onMove: (roomId: string) => void;
  className: string;
};

// Move button shared by the move list and the inn map. A locked room stays clickable: the server decides.
export default function RoomButton({ room, disabled, onMove, className }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onMove(room.id)}
      aria-label={`Aller à : ${room.name}${room.locked ? ' (verrouillée)' : ''}`}
      className={`inline-flex flex-wrap items-center justify-center gap-x-2 border text-lg text-ink transition-[border-color,transform] duration-150 ease-out enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:text-ink-faded motion-reduce:enabled:active:scale-100 ${
        room.locked ? 'border-dashed border-ink-faded enabled:hover:border-ink' : 'border-rule enabled:hover:border-ink-faded'
      } ${className}`}
    >
      {room.locked && <Padlock />}
      {room.name}
      {room.locked && <span className="text-ink-faded">(verrouillée)</span>}
    </button>
  );
}

function Padlock() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-[0.9em] shrink-0"
    >
      <rect x="3" y="7" width="10" height="7" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}
