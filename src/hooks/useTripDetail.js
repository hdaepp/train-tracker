import { useState, useEffect, useCallback } from 'react'
import { fetchTripSchedules, fetchTripPredictions, parseTime } from '../utils/mbta'

const POLL_INTERVAL = 15000

function buildStops(schedulesJson, predictionsJson, vehicleStopId, selectedStopId) {
  const stopMap = {}
  ;[...(schedulesJson.included || []), ...(predictionsJson.included || [])].forEach(item => {
    if (item.type === 'stop') stopMap[item.id] = item
  })

  const predictionByStop = {}
  ;(predictionsJson.data || []).forEach(p => {
    const sid = p.relationships?.stop?.data?.id
    if (sid) predictionByStop[sid] = p
  })

  const stops = (schedulesJson.data || [])
    .slice()
    .sort((a, b) => a.attributes.stop_sequence - b.attributes.stop_sequence)
    .map(sched => {
      const sid = sched.relationships?.stop?.data?.id
      const prediction = predictionByStop[sid] || null
      const scheduledTime = parseTime(sched.attributes.departure_time || sched.attributes.arrival_time)
      const predictedTime = prediction
        ? parseTime(prediction.attributes.departure_time || prediction.attributes.arrival_time)
        : null
      return {
        stopId: sid,
        stopName: stopMap[sid]?.attributes?.name || sid,
        sequence: sched.attributes.stop_sequence,
        scheduledTime,
        predictedTime,
        isCurrent: sid === vehicleStopId,
        isSelected: sid === selectedStopId,
        isPast: false,
      }
    })

  // Stops before the first predicted stop are already past
  const firstPredictedIdx = stops.findIndex(s => s.predictedTime !== null)
  if (firstPredictedIdx > 0) {
    stops.slice(0, firstPredictedIdx).forEach(s => { s.isPast = true })
  } else if (firstPredictedIdx === -1) {
    // No predictions at all — mark stops with past scheduled times as past
    const now = new Date()
    stops.forEach(s => { if (s.scheduledTime && s.scheduledTime < now) s.isPast = true })
  }

  return stops
}

export function useTripDetail(tripId, selectedStopId, vehicleStopId) {
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!tripId) return
    try {
      const [schedules, predictions] = await Promise.all([
        fetchTripSchedules(tripId),
        fetchTripPredictions(tripId),
      ])
      setStops(buildStops(schedules, predictions, vehicleStopId, selectedStopId))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tripId, selectedStopId, vehicleStopId])

  useEffect(() => {
    setLoading(true)
    setStops([])
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [refresh])

  return { stops, loading, error, refresh }
}
