import { useEffect, useState } from 'react';
import Inventory from '../components/Inventory.tsx';
import Notebook from '../components/Notebook.tsx';
import { getApiHealth } from '../services/api.ts';
import { mockInventory, mockNotebook } from '../services/mockData.ts';
import '../styles/global.css';

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking…');
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);

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

      {/* Zone C preview (issue #41) using mock data */}
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <Inventory
          clues={mockInventory}
          selectedClueId={selectedClueId}
          onSelect={setSelectedClueId}
        />
        <Notebook entries={mockNotebook} />
      </div>
    </main>
  );
}
