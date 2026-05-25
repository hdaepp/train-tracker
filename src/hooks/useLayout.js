import { useState, useEffect } from 'react'

const MQ = '(min-width: 768px)'

export function useLayout() {
  const [pref, setPrefState] = useState(() => localStorage.getItem('layoutPref') || 'auto')
  const [isWide, setIsWide] = useState(() => window.matchMedia(MQ).matches)

  useEffect(() => {
    const mq = window.matchMedia(MQ)
    const handler = e => setIsWide(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const layoutClass = pref === 'desktop' ? 'layout-desktop'
    : pref === 'mobile' ? 'layout-mobile'
    : isWide ? 'layout-desktop' : 'layout-mobile'

  function setPref(p) {
    setPrefState(p)
    localStorage.setItem('layoutPref', p)
  }

  return { layoutClass, pref, setPref }
}
