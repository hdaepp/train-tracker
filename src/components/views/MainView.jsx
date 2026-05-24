import TrainCard from '../TrainCard'

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
      <Section title="Inbound → Downtown" trains={inbound} />
      <Section title="Outbound → Medford/Tufts" trains={outbound} />
    </div>
  )
}
