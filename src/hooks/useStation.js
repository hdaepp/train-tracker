import { useState } from 'react'
import { STATIONS, DEFAULT_STOP_ID } from '../utils/mbta'

export function useStation() {
  const [stationId, setStationIdState] = useState(
    () => localStorage.getItem('stationId') || DEFAULT_STOP_ID
  )

  const station = STATIONS.find(s => s.id === stationId) ?? STATIONS[2]

  function setStation(id) {
    setStationIdState(id)
    localStorage.setItem('stationId', id)
  }

  return { stationId, station, setStation }
}
