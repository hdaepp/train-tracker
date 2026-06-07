import { formatTime } from '../../utils/mbta'

function CountRow({ label, count, addedCount }) {
  return (
    <div className="status-row">
      <span className="status-label">{label}</span>
      <span className="status-count">{count}</span>
      {addedCount > 0 && (
        <span className="status-added">{addedCount} ADDED-*</span>
      )}
    </div>
  )
}

function TrainBreakdown({ title, trains }) {
  const dispatched = trains.filter(t => t.isDispatched).length
  const staged = trains.filter(t => t.isStaged).length
  const scheduled = trains.filter(t => !t.isDispatched && !t.isStaged).length
  return (
    <div className="status-breakdown">
      <span className="status-breakdown-title">{title}</span>
      <span className="dispatched">{dispatched} dispatched</span>
      <span className="staged">{staged} staged</span>
      <span className="planned">{scheduled} scheduled</span>
    </div>
  )
}

export default function StatusView({ stats, inbound, outbound, error, lastUpdated }) {
  return (
    <div className="status-view">
      <p className="view-note">
        API health · {lastUpdated ? `Updated ${formatTime(lastUpdated)}` : 'Not yet loaded'}
      </p>

      {error && <p className="status-error">API error: {error}</p>}

      <div className="status-section">
        <h2 className="section-title">API responses</h2>
        {stats ? (
          <>
            <CountRow label="Schedules" count={stats.schedulesCount} addedCount={0} />
            <CountRow label="Predictions" count={stats.predictionsCount} addedCount={stats.addedPredictionCount} />
            <CountRow label="Vehicles" count={stats.vehiclesCount} addedCount={stats.addedVehicleCount} />
          </>
        ) : (
          <p className="empty">Loading…</p>
        )}
      </div>

      <div className="status-section">
        <h2 className="section-title">Displayed trains</h2>
        <TrainBreakdown title="Inbound" trains={inbound} />
        <TrainBreakdown title="Outbound" trains={outbound} />
      </div>

      {stats && (stats.addedVehicleCount > 0 || stats.addedPredictionCount > 0) && (
        <p className="status-note">
          MBTA is running some trips as real-time-only ADDED trips (no published schedule entry).
          These appear as Dispatched or Staged in the train list.
        </p>
      )}
    </div>
  )
}
