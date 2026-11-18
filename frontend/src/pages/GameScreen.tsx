import { useState } from 'react';
import AccusationModal from '../components/AccusationModal.tsx';
import ActionLog from '../components/ActionLog.tsx';
import DawnBanner from '../components/DawnBanner.tsx';
import ErrorMessage from '../components/ErrorMessage.tsx';
import type { GameError, ScreenProps } from '../hooks/useGame.ts';
import { isActionAllowed } from '../services/action-rules.ts';

type Props = ScreenProps & {
  // Last error of useGame, shown by this screen: inside the accusation modal for a refusal received while it is open
  error?: GameError | null;
};

const focusTitle = (title: HTMLHeadingElement | null) => title?.focus();

export default function GameScreen({ game, loading, actions, error = null }: Props) {
  const [accusing, setAccusing] = useState(false);
  // Error already on screen when the modal opened: not a refusal of this accusation
  const [errorAtOpening, setErrorAtOpening] = useState<GameError | null>(null);
  const accusationError = error && error !== errorAtOpening ? error.message : null;
  // One place per error: in the modal when it shows it, otherwise at the top of the screen
  const errorInModal = accusing && accusationError !== null;

  function openAccusation() {
    setErrorAtOpening(error);
    setAccusing(true);
  }

  return (
    <section aria-labelledby="game-title">
      {error && !errorInModal && <ErrorMessage message={error.message} onRetry={error.retry} />}

      {/* Slot "accusation + dawn banner" */}
      <DawnBanner game={game} />

      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1
          id="game-title"
          tabIndex={-1}
          ref={focusTitle}
          className="text-4xl leading-tight italic outline-none sm:text-6xl"
        >
          L’enquête
        </h1>
        <button
          type="button"
          disabled={!isActionAllowed(game, loading, 'accuse')}
          onClick={openAccusation}
          className="border border-oxblood bg-oxblood px-6 py-3 text-lg text-ink transition-[background-color,transform] duration-150 ease-out enabled:hover:bg-oxblood-lit enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:enabled:active:scale-100"
        >
          Accuser
        </button>
      </div>

      <div className="mt-10">
        <ActionLog game={game} />
      </div>

      {accusing && (
        <AccusationModal
          game={game}
          loading={loading}
          actions={actions}
          error={accusationError}
          onClose={() => setAccusing(false)}
        />
      )}
    </section>
  );
}