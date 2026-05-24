import { formatTime } from '../../utils/mbta'

function deltaLabel(scheduledTime, predictedTime) {
  if (!predictedTime) return { text: '—', cls: 'neutral' }
  const diffMins = Math.round((predictedTime - scheduledTime) / 60000)
  if (diffMins <= 0) return { text: 'On time', cls: 'ontime' }
  if (diffMins === 1) return { text: '+1 min', cls: 'late' }
  return { text: `+${diffMins} min`, cls: 'late' }
}

function DetailsRow({ train }) {
  const delta = deltaLabel(train.scheduledTime, train.predictedTime)
  return (
    <div className="details-row">
      <span className="time scheduled">{formatTime(train.scheduledTime)}</span>
      <span className="time predicted">{train.predictedTime ? formatTime(train.predictedTime) : '—'}</span>
      <span className={`delta ${delta.cls}`}>{delta.text}</span>
      <span className="vehicle-loc">
        {train.vehicle
          ? `${train.vehicle.status === 'STOPPED_AT' ? 'At' : '→'} ${train.vehicle.stopName}`
          : '—'}
      </span>
    </div>
  )
}

function DetailsSection({ title, trains }) {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <div className="details-header">
        <span>Scheduled</span>
        <span>Predicted</span>
        <span>Δ</span>
        <span>Location</span>
      </div>
      {trains.length === 0 ? (
        <p className="empty">No upcoming trains</p>
      ) : (
        trains.map(train => <DetailsRow key={train.id} train={train} />)
      )}
    </div>
  )
}

export default function DetailsView({ inbound, outbound }) {
  return (
    <div className="details-view">
      <p className="view-note">How well is service running right now?</p>
      <DetailsSection title="Inbound → Downtown" trains={inbound} />
      <DetailsSection title="Outbound → Medford/Tufts" trains={outbound} />
    </div>
  )
}
