const focusTitle = (title: HTMLHeadingElement | null) => title?.focus();

export default function GameScreen() {
  return (
    <section aria-labelledby="game-title">
      <h1
        id="game-title"
        tabIndex={-1}
        ref={focusTitle}
        className="text-4xl leading-tight italic outline-none sm:text-6xl"
      >
        L’enquête
      </h1>
    </section>
  );
}
