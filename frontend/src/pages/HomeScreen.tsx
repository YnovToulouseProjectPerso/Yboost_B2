export default function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="text-5xl leading-none italic sm:text-7xl">
        La Dernière Auberge
      </h1>
      <button
        type="button"
        onClick={onStart}
        className="mt-12 border border-oxblood bg-oxblood px-6 py-3 text-lg text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-oxblood-lit active:scale-[0.97] motion-reduce:active:scale-100"
      >
        Nouvelle enquête
      </button>
    </section>
  );
}
