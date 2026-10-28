import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-400-italic.css';
import '@fontsource/eb-garamond/latin-600.css';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App.tsx';

const root = createRoot(document.getElementById('root')!);

// Dev-only demo of components fed with simulated games (/#demo), removed from the build
if (import.meta.env.DEV && location.hash === '#demo') {
  import('./pages/DemoScreen.tsx').then(({ default: DemoScreen }) =>
    root.render(
      <StrictMode>
        <DemoScreen />
      </StrictMode>,
    ),
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
