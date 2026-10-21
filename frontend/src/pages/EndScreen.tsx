const focusTitle = (title: HTMLHeadingElement | null) => title?.focus();

export default function EndScreen() {
  return (
    <section aria-labelledby="end-title">
      <h1
        id="end-title"
        tabIndex={-1}
        ref={focusTitle}
        className="text-4xl leading-tight italic outline-none sm:text-6xl"
      >
        L’aube
      </h1>
    </section>
  );
}
