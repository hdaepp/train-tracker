import { useState, useEffect, useRef } from 'react'

const LAYOUT_OPTIONS = [
  { id: 'auto', label: 'Auto', description: 'Follow screen width' },
  { id: 'mobile', label: 'Mobile', description: 'Always narrow' },
  { id: 'desktop', label: 'Desktop', description: 'Always wide' },
]

export default function HamburgerMenu({ pref, setPref }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onOutsideClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onOutsideClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  return (
    <div className="hamburger-menu" ref={ref}>
      <button
        className="hamburger-btn"
        onClick={() => setOpen(v => !v)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        ☰
      </button>

      {open && (
        <div className="hamburger-dropdown">
          <div className="hamburger-section-label">Layout</div>
          {LAYOUT_OPTIONS.map(o => (
            <button
              key={o.id}
              className={`hamburger-option ${pref === o.id ? 'active' : ''}`}
              onClick={() => { setPref(o.id); setOpen(false) }}
            >
              <span className="option-label">{o.label}</span>
              <span className="option-desc">{o.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
