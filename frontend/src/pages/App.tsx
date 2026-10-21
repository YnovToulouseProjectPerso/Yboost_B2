import { useEffect, useState } from 'react';
import { getApiHealth } from '../services/api.ts';
import '../styles/global.css';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking…');

  useEffect(() => {
    let isMounted = true;

    getApiHealth()
      .then((health) => {
        if (isMounted) setApiStatus(`Connected (${health.status})`);
      })
      .catch(() => {
        if (isMounted) setApiStatus('Unavailable');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">Yboost B2</p>
        <h1 id="welcome-title">Your project starts here.</h1>
        <p className="intro">
          The React frontend is ready. Build your application by adding
          components and pages to the project structure.
        </p>
        <div className="api-status" role="status">
          <span className="status-indicator" aria-hidden="true" />
          <span>Backend API: {apiStatus}</span>
        </div>
      </section>
    </main>
  );
}
