import { useState } from 'react'
import { useMBTA } from './hooks/useMBTA'
import ViewSwitcher from './components/ViewSwitcher'
import MainView from './components/views/MainView'
import PlannedView from './components/views/PlannedView'
import DetailsView from './components/views/DetailsView'
import { formatTime } from './utils/mbta'
import './App.css'

export default function App() {
  const [view, setView] = useState('main')
  const { inbound, outbound, loading, error, lastUpdated, refresh } = useMBTA()

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>Magoun Square</h1>
          <button className="refresh-btn" onClick={refresh} title="Refresh">↻</button>
        </div>
        <div className="header-sub">
          Green Line E ·{' '}
          {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : 'Loading…'}
        </div>
        <ViewSwitcher activeView={view} onViewChange={setView} />
      </header>

      <main className="app-body">
        {error && <div className="error-banner">Error: {error}</div>}
        {loading && !lastUpdated ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            {view === 'main' && <MainView inbound={inbound} outbound={outbound} />}
            {view === 'planned' && <PlannedView inbound={inbound} outbound={outbound} />}
            {view === 'details' && <DetailsView inbound={inbound} outbound={outbound} />}
          </>
        )}
      </main>
    </div>
  )
}
