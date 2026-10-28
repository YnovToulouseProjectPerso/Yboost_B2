import ErrorMessage from '../components/ErrorMessage.tsx';
import { useGame } from '../hooks/useGame.ts';
import EndScreen from './EndScreen.tsx';
import GameScreen from './GameScreen.tsx';
import HomeScreen from './HomeScreen.tsx';

export default function App() {
  const { game, loading, error, actions } = useGame();
  const isOver = game?.status === 'victory' || game?.status === 'defeat';

  return (
    <div className="min-h-dvh p-3 sm:p-8">
      <main className="mx-auto min-h-[calc(100dvh-1.5rem)] max-w-6xl border border-rule bg-page px-6 py-10 sm:min-h-[calc(100dvh-4rem)] sm:px-14 sm:py-14">
        {error && <ErrorMessage message={error.message} onRetry={error.retry} />}
        {!game && <HomeScreen loading={loading} onStart={() => actions.newGame()} />}
        {game && !isOver && <GameScreen game={game} loading={loading} actions={actions} />}
        {game && isOver && <EndScreen game={game} loading={loading} actions={actions} />}
      </main>
    </div>
  );
}
