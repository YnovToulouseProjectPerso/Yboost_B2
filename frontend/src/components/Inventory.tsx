import type { Game } from '../services/game.ts';

export default function Inventory({ game }: { game: Game }) {
  return (
    <section aria-labelledby="inventory-title">
      <h2 id="inventory-title" className="tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">
        Inventaire
      </h2>

      {game.items.length === 0 ? (
        <p className="mt-3 text-ink-faded">Aucun objet</p>
      ) : (
        <ul className="mt-3 border-t border-rule">
          {game.items.map((item) => (
            <li key={item.id} className="border-b border-rule py-2">
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
