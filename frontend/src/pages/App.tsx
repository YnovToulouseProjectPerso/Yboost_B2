import { useState } from 'react';
import EndScreen from './EndScreen.tsx';
import GameScreen from './GameScreen.tsx';
import HomeScreen from './HomeScreen.tsx';

type Screen = 'home' | 'game' | 'end';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <div className="min-h-dvh p-3 sm:p-8">
      <main className="mx-auto min-h-[calc(100dvh-1.5rem)] max-w-6xl border border-rule bg-page px-6 py-10 sm:min-h-[calc(100dvh-4rem)] sm:px-14 sm:py-14">
        {screen === 'home' && <HomeScreen onStart={() => setScreen('game')} />}
        {screen === 'game' && <GameScreen />}
        {screen === 'end' && <EndScreen />}
      </main>
    </div>
  );
}
