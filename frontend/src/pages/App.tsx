import { useEffect, useRef } from 'react';
import ErrorMessage from '../components/ErrorMessage.tsx';
import { useGame } from '../hooks/useGame.ts';
import EndScreen from './EndScreen.tsx';
import GameScreen from './GameScreen.tsx';
import HomeScreen from './HomeScreen.tsx';

export default function App() {
  const { game, summary, loading, error, actions } = useGame();
  const isOver = game?.status === 'victory' || game?.status === 'defeat';

  // Load the summary once per finished game, through the API client (GET /summary)
  const summaryRequestedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!game || !isOver || summary || loading || summaryRequestedFor.current === game.gameId) return;
    summaryRequestedFor.current = game.gameId;
    actions.loadSummary();
  });

  return (
    <div className="min-h-dvh p-3 sm:p-8">
      <main className="mx-auto min-h-[calc(100dvh-1.5rem)] max-w-6xl border border-rule bg-page px-6 py-10 sm:min-h-[calc(100dvh-4rem)] sm:px-14 sm:py-14">
        {error && <ErrorMessage message={error.message} onRetry={error.retry} />}
        {!game && <HomeScreen loading={loading} onNewGame={actions.newGame} />}
        {game && !isOver && <GameScreen game={game} loading={loading} actions={actions} error={error} />}
        {game && isOver && (
          <EndScreen
            game={game}
            summary={summary}
            loading={loading}
            error={null}
            onReplay={() => actions.newGame()}
            onReplaySameGame={(seed) => actions.newGame(seed)}
          />
        )}
      </main>
    </div>
  );
}
