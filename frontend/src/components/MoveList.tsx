import { useId } from 'react';
import type { ScreenProps } from '../hooks/useGame.ts';
import RoomButton from './RoomButton.tsx';

export default function MoveList({ game, loading, actions }: ScreenProps) {
  const titleId = useId();
  const disabled = loading || game.status !== 'in_progress';

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className="tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">
        Se déplacer
      </h2>

      {game.adjacentRooms.length === 0 ? (
        <p className="mt-3 text-ink-faded">Aucune pièce accessible d’ici.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-3">
          {game.adjacentRooms.map((room) => (
            <li key={room.id}>
              <RoomButton room={room} disabled={disabled} onMove={actions.move} className="px-6 py-3" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
