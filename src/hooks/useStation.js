import { useState, useEffect } from 'react'
import { STATIONS, DEFAULT_STOP_ID } from '../utils/mbta'

function getInitialStation() {
  const params = new URLSearchParams(window.location.search)
  const urlStation = params.get('station')
  if (urlStation && STATIONS.find(s => s.id === urlStation)) return urlStation
  return localStorage.getItem('stationId') || DEFAULT_STOP_ID
}

export function useStation() {
  const [stationId, setStationIdState] = useState(getInitialStation)

  useEffect(() => {
    const url = new URL(window.location)
    url.searchParams.set('station', stationId)
    history.replaceState(null, '', url)
    localStorage.setItem('stationId', stationId)
  }, [stationId])

  const station = STATIONS.find(s => s.id === stationId) ?? STATIONS[2]

  function setStation(id) {
    setStationIdState(id)
  }

  return { stationId, station, setStation }
}
