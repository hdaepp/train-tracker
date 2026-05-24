import { formatTime } from '../../utils/mbta'

function ScheduleRow({ train }) {
  return (
    <div className="schedule-row">
      <span className="time">{formatTime(train.scheduledTime)}</span>
      <span className="headsign">{train.headsign || 'Green Line'}</span>
    </div>
  )
}

function ScheduleSection({ title, trains }) {
  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      {trains.length === 0 ? (
        <p className="empty">No scheduled trains in the next 3 hours</p>
      ) : (
        trains.map(train => <ScheduleRow key={train.id} train={train} />)
      )}
    </div>
  )
}

export default function PlannedView({ inbound, outbound }) {
  return (
    <div className="planned-view">
      <p className="view-note">Published MBTA schedule — no live data</p>
      <ScheduleSection title="Inbound → Downtown" trains={inbound} />
      <ScheduleSection title="Outbound → Medford/Tufts" trains={outbound} />
    </div>
  )
}
