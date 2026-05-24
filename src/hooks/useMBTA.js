import { useState, useEffect, useCallback } from 'react'
import { fetchPredictions, fetchSchedules, fetchVehicles, parseTime } from '../utils/mbta'

const POLL_INTERVAL = 30000

function mergeTripData(schedulesJson, predictionsJson, vehiclesJson) {
  const included = [
    ...(schedulesJson.included || []),
    ...(predictionsJson.included || []),
  ]

  const tripMap = {}
  const stopMap = {}
  included.forEach(item => {
    if (item.type === 'trip') tripMap[item.id] = item
    if (item.type === 'stop') stopMap[item.id] = item
  })

  const vehicleByTrip = {}
  ;(vehiclesJson.data || []).forEach(v => {
    const tripId = v.relationships?.trip?.data?.id
    const stopId = v.relationships?.stop?.data?.id
    if (tripId) {
      vehicleByTrip[tripId] = {
        status: v.attributes.current_status,
        stopName: stopMap[stopId]?.attributes?.name || stopId,
        label: v.attributes.label,
      }
    }
  })

  const predictionByTrip = {}
  ;(predictionsJson.data || []).forEach(p => {
    const tripId = p.relationships?.trip?.data?.id
    if (tripId) predictionByTrip[tripId] = p
  })

  const trains = []
  const seenTrips = new Set()

  ;(schedulesJson.data || []).forEach(sched => {
    const tripId = sched.relationships?.trip?.data?.id
    if (!tripId || seenTrips.has(tripId)) return
    seenTrips.add(tripId)

    const prediction = predictionByTrip[tripId] || null
    const vehicle = vehicleByTrip[tripId] || null
    const tripData = tripMap[tripId] || null

    const scheduledTime = parseTime(sched.attributes.departure_time || sched.attributes.arrival_time)
    const predictedTime = prediction
      ? parseTime(prediction.attributes.departure_time || prediction.attributes.arrival_time)
      : null

    trains.push({
      id: tripId,
      directionId: sched.attributes.direction_id,
      scheduledTime,
      predictedTime,
      isDispatched: !!prediction,
      vehicle,
      headsign: tripData?.attributes?.headsign || '',
    })
  })

  trains.sort((a, b) => {
    const ta = a.predictedTime || a.scheduledTime
    const tb = b.predictedTime || b.scheduledTime
    return ta - tb
  })

  return {
    inbound: trains.filter(t => t.directionId === 1),
    outbound: trains.filter(t => t.directionId === 0),
  }
}

export function useMBTA() {
  const [data, setData] = useState({ inbound: [], outbound: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const [schedules, predictions, vehicles] = await Promise.all([
        fetchSchedules(),
        fetchPredictions(),
        fetchVehicles(),
      ])
      setData(mergeTripData(schedules, predictions, vehicles))
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [refresh])

  return { ...data, loading, error, lastUpdated, refresh }
}
