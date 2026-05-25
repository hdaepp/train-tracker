import { useRef, useEffect } from 'react'
import { useTripDetail } from '../../hooks/useTripDetail'
import { formatTime } from '../../utils/mbta'

function deltaLabel(scheduledTime, predictedTime) {
  if (!predictedTime) return { text: '—', cls: 'neutral' }
  const diffMins = Math.round((predictedTime - scheduledTime) / 60000)
  if (diffMins <= 0) return { text: 'On time', cls: 'ontime' }
  return { text: `+${diffMins} min`, cls: 'late' }
}

function statusBadge(train) {
  if (!train) return null
  if (train.isDispatched) return <span className="trip-badge dispatched">Dispatched</span>
  if (train.isStaged) return <span className="trip-badge staged">Staged</span>
  return <span className="trip-badge planned">Scheduled</span>
}

function StopRow({ stop }) {
  const delta = deltaLabel(stop.scheduledTime, stop.predictedTime)
  const cls = [
    'trip-stop-row',
    stop.isPast ? 'past' : '',
    stop.isCurrent ? 'current' : '',
    stop.isSelected ? 'selected' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <span className="trip-stop-name">
        {stop.isCurrent && <span className="trip-vehicle-marker">▶</span>}
        {stop.stopName}
        {stop.isSelected && <span className="trip-selected-marker"> ★</span>}
      </span>
      <span className="trip-stop-time">{formatTime(stop.scheduledTime)}</span>
      <span className="trip-stop-time predicted">
        {stop.predictedTime ? formatTime(stop.predictedTime) : '—'}
      </span>
      <span className={`trip-stop-delta ${delta.cls}`}>{delta.text}</span>
    </div>
  )
}

export default function TripDetailView({ tripId, train, selectedStopId, onBack }) {
  const vehicleStopId = train?.vehicle?.stopId ?? null
  const { stops, loading, error } = useTripDetail(tripId, selectedStopId, vehicleStopId)
  const selectedRef = useRef(null)

  // Scroll to the selected station once data loads
  useEffect(() => {
    if (!loading && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [loading])

  const selectedStop = stops.find(s => s.isSelected)
  const scheduledAtSelected = selectedStop ? formatTime(selectedStop.scheduledTime) : '—'

  return (
    <div className="trip-detail-view">
      <div className="trip-detail-header">
        <button className="trip-back-btn" onClick={onBack}>← Back</button>
        <div className="trip-detail-title">
          <span className="trip-headsign">{train?.headsign || 'Green Line E'}</span>
          <span className="trip-id">{tripId}</span>
        </div>
        {statusBadge(train)}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading itinerary…</div>
      ) : (
        <div className="trip-stop-list">
          <div className="trip-stop-header">
            <span>Stop</span>
            <span>Scheduled</span>
            <span>Predicted</span>
            <span>Δ</span>
          </div>
          {stops.map(stop => (
            <div key={stop.stopId} ref={stop.isSelected ? selectedRef : null}>
              <StopRow stop={stop} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
