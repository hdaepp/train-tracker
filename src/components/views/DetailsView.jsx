import { useRef } from 'react'
import { formatTime } from '../../utils/mbta'
import { deltaLabel } from '../../utils/format'

function statusInfo(train) {
  if (train.isDispatched) return { text: 'Dispatched', cls: 'dispatched' }
  if (train.isStaged) return { text: 'Staged', cls: 'staged' }
  return { text: 'Scheduled', cls: 'planned' }
}

function DebugRow({ train, onSelect }) {
  const delta = deltaLabel(train.scheduledTime, train.predictedTime)
  const status = statusInfo(train)
  const isPast = !train.predictedTime && train.scheduledTime < new Date()

  return (
    <div
      className={`debug-row ${isPast ? 'past' : ''} ${onSelect ? 'clickable' : ''}`}
      onClick={onSelect ? () => onSelect(train.id) : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? e => e.key === 'Enter' && onSelect(train.id) : undefined}
    >
      <span className="debug-trip-id">{train.id}</span>
      <span className="debug-time">{formatTime(train.scheduledTime)}</span>
      <span className="debug-time predicted">{train.predictedTime ? formatTime(train.predictedTime) : '—'}</span>
      <span className={`debug-delta ${delta.cls}`}>{delta.text}</span>
      <span className={`debug-status ${status.cls}`}>{status.text}</span>
      <span className="debug-block" title={train.blockId ?? ''}>{train.blockId ?? '—'}</span>
      <span className="debug-vehicle">{train.vehicle?.label ?? '—'}</span>
    </div>
  )
}

function DebugSection({ title, trains, nowRef, onSelect }) {
  const now = new Date()
  const anchorIndex = trains.findIndex(t => t.scheduledTime >= now)
  const effectiveAnchor = anchorIndex !== -1 ? anchorIndex : trains.length - 1

  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>
      <div className="debug-header">
        <span>Trip ID</span>
        <span>Scheduled</span>
        <span>Predicted</span>
        <span>Δ</span>
        <span>Status</span>
        <span>Block</span>
        <span>Car</span>
      </div>
      {trains.length === 0 ? (
        <p className="empty">No trips</p>
      ) : (
        trains.map((train, i) =>
          i === effectiveAnchor ? (
            <div key={train.id} ref={nowRef} className="now-anchor-row">
              <DebugRow train={train} onSelect={onSelect} />
            </div>
          ) : (
            <DebugRow key={train.id} train={train} onSelect={onSelect} />
          )
        )
      )}
    </div>
  )
}

export default function DetailsView({ inbound, outbound, onSelect }) {
  const inboundRef = useRef(null)
  const outboundRef = useRef(null)

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="details-view">
      <p className="view-note">All trips today. Block = planned vehicle run; Car = actual assignment.</p>
      <div className="sections-grid">
        <DebugSection title="Inbound → Downtown" trains={inbound} nowRef={inboundRef} onSelect={onSelect} />
        <DebugSection title="Outbound → Medford/Tufts" trains={outbound} nowRef={outboundRef} onSelect={onSelect} />
      </div>
      <div className="details-nav">
        <button className="details-nav-btn" onClick={() => scrollTo(inboundRef)}>↑ Inbound now</button>
        <button className="details-nav-btn" onClick={() => scrollTo(outboundRef)}>↓ Outbound now</button>
      </div>
    </div>
  )
}
