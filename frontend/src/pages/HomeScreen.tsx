import { useState, type FormEvent } from 'react';

type Props = {
  loading: boolean;
  message?: string;
  onNewGame: (seed?: number) => void;
};

const rules = [
  'Déplacez-vous d’une pièce à l’autre de l’auberge.',
  'Fouillez les pièces pour trouver des indices.',
  'Interrogez les suspects présents, ou confrontez-les à un indice.',
  'Accusez un suspect en apportant 2 indices de votre carnet.',
  'À l’aube, il ne vous reste plus qu’à accuser : c’est votre dernière chance.',
];

// Empty, or a strictly positive integer
function parseSeed(value: string): { valid: boolean; seed?: number } {
  const text = value.trim();
  if (text === '') {
    return { valid: true };
  }

  const seed = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(seed) || seed <= 0) {
    return { valid: false };
  }
  return { valid: true, seed };
}

export default function HomeScreen({ loading, message, onNewGame }: Props) {
  const [seedText, setSeedText] = useState('');
  const { valid, seed } = parseSeed(seedText);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !valid) {
      return;
    }
    if (seed === undefined) {
      onNewGame();
    } else {
      onNewGame(seed);
    }
  }

  return (
    <section aria-labelledby="home-title">
      {message && (
        <p role="status" className="mb-10 max-w-[65ch] border border-rule px-5 py-4">
          {message}
        </p>
      )}

      <h1 id="home-title" className="text-5xl leading-none italic sm:text-7xl">
        La Dernière Auberge
      </h1>

      <p className="mt-8 max-w-[65ch] text-lg">
        Une tempête bloque les voyageurs dans une auberge isolée. Au cœur de la nuit, l’aubergiste est retrouvé mort.
        Vous avez 12 actions avant l’aube pour désigner le coupable, preuves à l’appui.
      </p>

      <h2 className="mt-10 tracking-[0.12em] text-gilt [font-variant-caps:all-small-caps]">Règles</h2>
      <ul className="mt-3 max-w-[65ch] list-disc space-y-1 pl-6">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} noValidate className="mt-12 flex flex-col items-start gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="seed" className="text-ink-faded">
            Graine (facultative)
          </label>
          <input
            id="seed"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={seedText}
            onChange={(event) => setSeedText(event.target.value)}
            aria-invalid={!valid}
            aria-describedby={valid ? undefined : 'seed-error'}
            className="w-48 border border-rule bg-leather px-3 py-2 text-ink"
          />
          {!valid && (
            <p id="seed-error" className="text-sm text-oxblood-lit">
              La graine doit être un entier strictement positif, ou rester vide.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !valid}
          aria-busy={loading}
          className="border border-oxblood bg-oxblood px-6 py-3 text-lg text-ink transition-[background-color,transform] duration-150 ease-out enabled:hover:bg-oxblood-lit enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 aria-busy:cursor-wait motion-reduce:active:scale-100"
        >
          Nouvelle enquête
          {loading && <span aria-hidden="true">…</span>}
        </button>
      </form>
    </section>
  );
}
