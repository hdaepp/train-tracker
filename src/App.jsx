import { useState, useEffect } from 'react'
import { useMBTA } from './hooks/useMBTA'
import { useLayout } from './hooks/useLayout'
import { useStation } from './hooks/useStation'
import ViewSwitcher from './components/ViewSwitcher'
import HamburgerMenu from './components/HamburgerMenu'
import MainView from './components/views/MainView'
import DetailsView from './components/views/DetailsView'
import TripDetailView from './components/views/TripDetailView'
import { formatTime, STATIONS } from './utils/mbta'
import './App.css'

export default function App() {
  const [view, setView] = useState('main')
  const [selectedTripId, setSelectedTripId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('trip') || null
  })
  const { stationId, setStation } = useStation()
  const { inbound, outbound, loading, error, lastUpdated, refresh } = useMBTA(stationId)
  const { layoutClass, pref, setPref } = useLayout()

  useEffect(() => {
    const url = new URL(window.location)
    if (selectedTripId) {
      url.searchParams.set('trip', selectedTripId)
    } else {
      url.searchParams.delete('trip')
    }
    history.replaceState(null, '', url)
  }, [selectedTripId])

  const allTrains = [...inbound, ...outbound]
  const selectedTrain = selectedTripId
    ? allTrains.find(t => t.id === selectedTripId) ?? null
    : null

  function handleBack() {
    setSelectedTripId(null)
  }

  return (
    <div className={`app ${layoutClass}`}>
      <header className="app-header">
        <div className="header-top">
          <h1>
            <select
              className="station-select"
              value={stationId}
              onChange={e => setStation(e.target.value)}
              aria-label="Select station"
            >
              {STATIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={refresh} title="Refresh">↻</button>
            <HamburgerMenu pref={pref} setPref={setPref} />
          </div>
        </div>
        <div className="header-sub">
          Green Line E ·{' '}
          {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : 'Loading…'}
        </div>
        {!selectedTripId && <ViewSwitcher activeView={view} onViewChange={setView} />}
      </header>

      <main className="app-body">
        {error && <div className="error-banner">Error: {error}</div>}
        {selectedTripId ? (
          <TripDetailView
            tripId={selectedTripId}
            train={selectedTrain}
            selectedStopId={stationId}
            onBack={handleBack}
          />
        ) : loading && !lastUpdated ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            {view === 'main' && (
              <MainView inbound={inbound} outbound={outbound} onSelect={setSelectedTripId} />
            )}
            {view === 'details' && (
              <DetailsView inbound={inbound} outbound={outbound} onSelect={setSelectedTripId} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
