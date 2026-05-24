export default function ViewSwitcher({ activeView, onViewChange }) {
  const views = [
    { id: 'main', label: 'Live' },
    { id: 'planned', label: 'Schedule' },
    { id: 'details', label: 'Details' },
  ]

  return (
    <div className="view-switcher">
      {views.map(v => (
        <button
          key={v.id}
          className={`view-tab ${activeView === v.id ? 'active' : ''}`}
          onClick={() => onViewChange(v.id)}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
