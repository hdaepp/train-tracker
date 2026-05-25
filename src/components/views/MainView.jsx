import TrainCard from '../TrainCard'

const MAX_TRAINS = 5

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
  return (
    <div className="main-view">
      <div className="legend">
        <span className="legend-item dispatched">Dispatched (live)</span>
        <span className="legend-item planned">Scheduled only</span>
      </div>
      <Section title="Inbound → Downtown" trains={upcomingTrains(inbound)} />
      <Section title="Outbound → Medford/Tufts" trains={upcomingTrains(outbound)} />
    </div>
  )
}
