import { useBlockDetail } from '../../hooks/useBlockDetail'
import { formatTime } from '../../utils/mbta'

function statusInfo(trip) {
  if (trip.isDispatched) return { text: 'Dispatched', cls: 'dispatched' }
  if (trip.isStaged)     return { text: 'Staged',     cls: 'staged' }
  return                        { text: 'Scheduled',  cls: 'planned' }
}

export default function BlockView({ blockId, blockTrips, currentTripId, onBack, onSelectTrip }) {
  const { trips, loading, error } = useBlockDetail(blockId, blockTrips)

  return (
    <div className="trip-detail-view">
      <div className="trip-detail-header">
        <button className="trip-back-btn" onClick={onBack}>← Back</button>
        <div className="trip-detail-title">
          <span className="trip-headsign">Block Trips</span>
          <span className="trip-id">Block: {blockId}</span>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading block trips…</div>
      ) : (
        <div className="trip-stop-list">
          <div className="block-trip-header">
            <span>Trip ID</span>
            <span>Departs</span>
            <span>From</span>
            <span>To</span>
            <span>Status</span>
          </div>
          {trips.map(trip => {
            const status = statusInfo(trip)
            const isCurrent = trip.id === currentTripId
            return (
              <div
                key={trip.id}
                className={`block-trip-row clickable${isCurrent ? ' current' : ''}`}
                onClick={() => onSelectTrip(trip.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onSelectTrip(trip.id)}
              >
                <span className="debug-trip-id">{trip.id}</span>
                <span className="block-trip-time">{formatTime(trip.startTime)}</span>
                <span className="block-trip-stop">{trip.startStopName}</span>
                <span className="block-trip-stop">{trip.endStopName}</span>
                <span className={`debug-status ${status.cls}`}>{status.text}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
