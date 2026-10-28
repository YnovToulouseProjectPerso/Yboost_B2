export default function HomeScreen({ loading, onStart }: { loading: boolean; onStart: () => void }) {
  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="text-5xl leading-none italic sm:text-7xl">
        La Dernière Auberge
      </h1>
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        aria-busy={loading}
        className="mt-12 border border-oxblood bg-oxblood px-6 py-3 text-lg text-ink transition-[background-color,transform] duration-150 ease-out enabled:hover:bg-oxblood-lit enabled:active:scale-[0.97] disabled:cursor-wait disabled:opacity-70 motion-reduce:active:scale-100"
      >
        Nouvelle enquête
        {loading && <span aria-hidden="true">…</span>}
      </button>
    </section>
  );
}
