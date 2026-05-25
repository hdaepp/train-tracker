import { formatTime, minutesFromNow } from '../utils/mbta'

function cardClass(train) {
  if (train.isDispatched) return 'dispatched'
  if (train.isStaged) return 'staged'
  return 'planned'
}

function statusLabel(train) {
  if (train.isDispatched) return null
  if (train.isStaged) return 'Staged'
  return 'Scheduled'
}

export default function TrainCard({ train, isNext, onSelect }) {
  const displayTime = train.predictedTime || train.scheduledTime
  const mins = minutesFromNow(displayTime)
  const minsLabel = mins === null ? '' : mins <= 0 ? 'now' : `${mins} min`
  const label = statusLabel(train)

  return (
    <div
      className={`train-card ${cardClass(train)} ${isNext ? 'next' : ''} ${onSelect ? 'clickable' : ''}`}
      onClick={onSelect ? () => onSelect(train.id) : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? e => e.key === 'Enter' && onSelect(train.id) : undefined}
    >
      <div className="train-card-time">
        <span className="time">{formatTime(displayTime)}</span>
        <span className="mins">{minsLabel}</span>
      </div>
      <div className="train-card-info">
        <span className="headsign">{train.headsign || 'Green Line'}</span>
        {label && <span className="source-label">{label}</span>}
        {train.vehicle && (
          <span className="vehicle-status">
            {train.vehicle.status === 'STOPPED_AT' ? 'at' : 'toward'} {train.vehicle.stopName}
          </span>
        )}
      </div>
    </div>
  )
}
