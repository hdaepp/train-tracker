import { useState } from 'react'
import TrainCard from '../TrainCard'

const MAX_TRAINS = 5

const STATUS_INFO = [
  {
    cls: 'dispatched',
    label: 'Dispatched',
    description: 'The MBTA is publishing live predictions for this trip. The train is en route and actively reporting its location.',
  },
  {
    cls: 'staged',
    label: 'Staged',
    description: 'A vehicle has been assigned to this trip\'s ID and is likely waiting at the terminus, but live predictions haven\'t started yet.',
  },
  {
    cls: 'planned',
    label: 'Scheduled',
    description: 'This trip exists in the published timetable, but no vehicle has been assigned to it yet. Time shown is the scheduled departure.',
  },
]

function upcomingTrains(trains) {
  const now = new Date()
  return trains
    .filter(t => (t.predictedTime || t.scheduledTime) > now)
    .slice(0, MAX_TRAINS)
}

function Section({ title, trains }) {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      {trains.length === 0 ? (
        <p className="empty">No upcoming trains</p>
      ) : (
        trains.map((train, i) => (
          <TrainCard key={train.id} train={train} isNext={i === 0} />
        ))
      )}
    </div>
  )
}

export default function MainView({ inbound, outbound }) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="main-view">
      <button
        className="legend"
        onClick={() => setShowInfo(v => !v)}
        aria-expanded={showInfo}
        title="What do these mean?"
      >
        {STATUS_INFO.map(s => (
          <span key={s.cls} className={`legend-item ${s.cls}`}>{s.label}</span>
        ))}
        <span className="legend-hint">{showInfo ? '▲' : '▼'}</span>
      </button>

      {showInfo && (
        <div className="legend-popover">
          <p className="legend-popover-intro">
            Each trip has a scheduled ID. Each physical train (vehicle) has its own ID.
            These are matched to determine a train's status:
          </p>
          {STATUS_INFO.map(s => (
            <div key={s.cls} className="legend-popover-row">
              <span className={`legend-swatch ${s.cls}`} />
              <div>
                <strong>{s.label}</strong>
                <p>{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Section title="Inbound → Downtown" trains={upcomingTrains(inbound)} />
      <Section title="Outbound → Medford/Tufts" trains={upcomingTrains(outbound)} />
    </div>
  )
}
