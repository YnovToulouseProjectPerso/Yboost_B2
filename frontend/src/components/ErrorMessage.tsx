export default function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="mb-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border border-rule px-5 py-4 transition-opacity duration-200 ease-out starting:opacity-0"
    >
      <p className="max-w-[65ch]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="border border-rule px-6 py-3 text-lg text-ink transition-[border-color,transform] duration-150 ease-out hover:border-ink-faded active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
