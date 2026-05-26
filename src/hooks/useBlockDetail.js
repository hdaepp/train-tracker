import { useState, useEffect } from 'react'
import { fetchBlockSchedules, parseTime } from '../utils/mbta'

export function useBlockDetail(blockId, blockTrips) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tripIdsKey = blockTrips.map(t => t.id).join(',')

  useEffect(() => {
    if (!blockId || !blockTrips.length) return

    async function load() {
      setLoading(true)
      try {
        const tripIds = blockTrips.map(t => t.id)
        const json = await fetchBlockSchedules(tripIds)

        const stopMap = {}
        ;(json.included || []).forEach(item => {
          if (item.type === 'stop') stopMap[item.id] = item
        })

        const schedsByTrip = {}
        ;(json.data || []).forEach(sched => {
          const tripId = sched.relationships?.trip?.data?.id
          if (!tripId) return
          if (!schedsByTrip[tripId]) schedsByTrip[tripId] = []
          schedsByTrip[tripId].push(sched)
        })

        const result = blockTrips.map(train => {
          const scheds = (schedsByTrip[train.id] || [])
            .sort((a, b) => a.attributes.stop_sequence - b.attributes.stop_sequence)
          const first = scheds[0]
          const last = scheds[scheds.length - 1]

          return {
            id: train.id,
            directionId: train.directionId,
            headsign: train.headsign,
            isDispatched: train.isDispatched,
            isStaged: train.isStaged,
            startStopName: stopMap[first?.relationships?.stop?.data?.id]?.attributes?.name ?? '—',
            startTime: parseTime(first?.attributes?.departure_time ?? first?.attributes?.arrival_time),
            endStopName: stopMap[last?.relationships?.stop?.data?.id]?.attributes?.name ?? '—',
          }
        })

        result.sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0))
        setTrips(result)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId, tripIdsKey])

  return { trips, loading, error }
}
