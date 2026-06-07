import { useState, useEffect } from 'react'
import { useMBTA } from './hooks/useMBTA'
import { useLayout } from './hooks/useLayout'
import { useStation } from './hooks/useStation'
import ViewSwitcher from './components/ViewSwitcher'
import HamburgerMenu from './components/HamburgerMenu'
import MainView from './components/views/MainView'
import DetailsView from './components/views/DetailsView'
import TripDetailView from './components/views/TripDetailView'
import BlockView from './components/views/BlockView'
import StatusView from './components/views/StatusView'
import { formatTime, STATIONS } from './utils/mbta'
import './App.css'

export default function App() {
  const [view, setView] = useState('main')
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [selectedTripId, setSelectedTripId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('trip') || null
  })
  const { stationId, setStation } = useStation()
  const { inbound, outbound, loading, error, lastUpdated, refresh, stats } = useMBTA(stationId)
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

  const blockTrips = selectedBlockId
    ? allTrains.filter(t => t.blockId === selectedBlockId)
    : []

  const blockActiveTripId = selectedTrain?.blockId
    ? (allTrains.find(t =>
        t.blockId === selectedTrain.blockId &&
        t.id !== selectedTripId &&
        (t.isDispatched || t.isStaged)
      )?.id ?? null)
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
        {!selectedTripId && !selectedBlockId && <ViewSwitcher activeView={view} onViewChange={setView} />}
      </header>

      <main className="app-body">
        {error && <div className="error-banner">Error: {error}</div>}
        {selectedBlockId ? (
          <BlockView
            blockId={selectedBlockId}
            blockTrips={blockTrips}
            currentTripId={selectedTripId}
            onBack={() => setSelectedBlockId(null)}
            onSelectTrip={(tripId) => { setSelectedBlockId(null); setSelectedTripId(tripId) }}
          />
        ) : selectedTripId ? (
          <TripDetailView
            tripId={selectedTripId}
            train={selectedTrain}
            selectedStopId={stationId}
            onBack={handleBack}
            onSelect={setSelectedTripId}
            onSelectBlock={setSelectedBlockId}
            blockActiveTripId={blockActiveTripId}
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
            {view === 'status' && (
              <StatusView
                stats={stats}
                inbound={inbound}
                outbound={outbound}
                error={error}
                lastUpdated={lastUpdated}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
