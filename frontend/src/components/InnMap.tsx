import { useId } from 'react';
import type { ScreenProps } from '../hooks/useGame.ts';
import RoomButton from './RoomButton.tsx';

// Line to the room on the left, or down to the room below, drawn in the grid gap
const LINK_LEFT =
  '@2xl:before:absolute @2xl:before:top-1/2 @2xl:before:right-full @2xl:before:w-6 @2xl:before:border-t @2xl:before:border-rule';
const LINK_DOWN =
  '@2xl:before:absolute @2xl:before:top-full @2xl:before:left-1/2 @2xl:before:h-6 @2xl:before:border-l @2xl:before:border-rule';

// Fixed layout of the inn (docs/02 › Plan de l'auberge): names and positions only, nothing about the investigation
//                   [ecurie]
// [cellar]—[cuisine]—[hall]—[couloir]—[office]
const ROOMS = [
  { id: 'hall', name: 'Salle commune', cell: `@2xl:col-start-3 @2xl:row-start-2 ${LINK_LEFT}` },
  { id: 'cuisine', name: 'Cuisine', cell: `@2xl:col-start-2 @2xl:row-start-2 ${LINK_LEFT}` },
  { id: 'cellar', name: 'Cave', cell: '@2xl:col-start-1 @2xl:row-start-2' },
  { id: 'couloir', name: 'Couloir des chambres', cell: `@2xl:col-start-4 @2xl:row-start-2 ${LINK_LEFT}` },
  { id: 'office', name: 'Bureau d’Armand', cell: `@2xl:col-start-5 @2xl:row-start-2 ${LINK_LEFT}` },
  { id: 'ecurie', name: 'Écurie', cell: `@2xl:col-start-3 @2xl:row-start-1 ${LINK_DOWN}` },
];

export default function InnMap({ game, loading, actions }: ScreenProps) {
  const titleId = useId();
  const disabled = loading || game.status !== 'in_progress';

  return (
    <section aria-labelledby={titleId} className="@container">
      <h2 id={titleId} className="tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">
        Plan de l’auberge
      </h2>

      {/* One column in a narrow container, the inn layout from 42rem. Only the rooms you can reach are framed. */}
      <ul className="mt-3 grid gap-3 @2xl:grid-cols-5 @2xl:gap-6">
        {ROOMS.map(({ id, name, cell }) => {
          const adjacent = game.adjacentRooms.find((room) => room.id === id);
          const here = game.currentRoom.id === id;

          return (
            <li key={id} className={`relative ${cell}`}>
              {adjacent ? (
                <RoomButton
                  room={adjacent}
                  disabled={disabled}
                  onMove={actions.move}
                  className="size-full px-3 py-3"
                />
              ) : (
                <div
                  className={`flex size-full flex-col items-center justify-center px-3 py-3 text-center text-lg ${
                    here ? 'border border-gilt' : 'text-ink-faded'
                  }`}
                >
                  {here ? game.currentRoom.name : name}
                  {here && (
                    <span className="tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">Vous êtes ici</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
