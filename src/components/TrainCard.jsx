import { formatTime, minutesFromNow } from '../utils/mbta'

export default function TrainCard({ train, isNext }) {
  const displayTime = train.predictedTime || train.scheduledTime
  const mins = minutesFromNow(displayTime)
  const minsLabel = mins === null ? '' : mins <= 0 ? 'now' : `${mins} min`

  return (
    <div className={`train-card ${train.isDispatched ? 'dispatched' : 'planned'} ${isNext ? 'next' : ''}`}>
      <div className="train-card-time">
        <span className="time">{formatTime(displayTime)}</span>
        <span className="mins">{minsLabel}</span>
      </div>
      <div className="train-card-info">
        <span className="headsign">{train.headsign || 'Green Line'}</span>
        {!train.isDispatched && <span className="source-label">Scheduled</span>}
        {train.vehicle && (
          <span className="vehicle-status">
            {train.vehicle.status === 'STOPPED_AT' ? 'at' : 'toward'} {train.vehicle.stopName}
          </span>
        )}
      </div>
    </div>
  )
}
