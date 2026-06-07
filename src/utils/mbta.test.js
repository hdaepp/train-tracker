import { describe, it, expect } from 'vitest'
import { formatTime, parseTime } from './mbta'
import { mergeTripData } from '../hooks/useMBTA'

describe('parseTime', () => {
  it('returns null for null input', () => {
    expect(parseTime(null)).toBeNull()
  })

  it('returns a Date for a valid ISO string', () => {
    const result = parseTime('2024-01-01T09:05:00-05:00')
    expect(result).toBeInstanceOf(Date)
    expect(isNaN(result.getTime())).toBe(false)
  })
})

describe('formatTime', () => {
  it('returns — for null input', () => {
    expect(formatTime(null)).toBe('—')
  })

  it('returns a non-empty time string for a valid date', () => {
    const result = formatTime(new Date('2024-01-01T14:05:00'))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).toMatch(/\d+:\d{2}/)
  })
})

// Helpers for building minimal MBTA JSON:API shapes
function makeTrip(id, directionId = 0, headsign = 'Heath Street', blockId = 'B800-1') {
  return { id, type: 'trip', attributes: { direction_id: directionId, headsign, block_id: blockId } }
}

function makeSchedule(tripId, time = '2024-01-01T10:00:00-05:00', directionId = 0) {
  return {
    type: 'schedule',
    attributes: { departure_time: time, arrival_time: time, direction_id: directionId },
    relationships: { trip: { data: { id: tripId, type: 'trip' } } },
  }
}

function makePrediction(tripId, time = '2024-01-01T10:02:00-05:00') {
  return {
    type: 'prediction',
    attributes: { departure_time: time, arrival_time: time },
    relationships: { trip: { data: { id: tripId, type: 'trip' } } },
  }
}

function makeVehicle(tripId, stopId = 'stop-1', label = '3800') {
  return {
    type: 'vehicle',
    attributes: { current_status: 'IN_TRANSIT_TO', label },
    relationships: {
      trip: { data: { id: tripId, type: 'trip' } },
      stop: { data: { id: stopId, type: 'stop' } },
    },
  }
}

function makeStop(id, name = 'Test Stop') {
  return { id, type: 'stop', attributes: { name } }
}

const TRIP_A = 'trip-scheduled-A'
const TRIP_B = 'trip-scheduled-B'
const ADDED_C = 'ADDED-1234'
const ADDED_D = 'ADDED-5678'

describe('mergeTripData', () => {
  it('returns a scheduled train with no prediction or vehicle', () => {
    const schedules = { data: [makeSchedule(TRIP_A)], included: [makeTrip(TRIP_A)] }
    const predictions = { data: [], included: [] }
    const vehicles = { data: [], included: [] }

    const { inbound } = mergeTripData(schedules, predictions, vehicles)
    expect(inbound).toHaveLength(1)
    const train = inbound[0]
    expect(train.id).toBe(TRIP_A)
    expect(train.isDispatched).toBe(false)
    expect(train.isStaged).toBe(false)
    expect(train.scheduledTime).toBeInstanceOf(Date)
    expect(train.predictedTime).toBeNull()
  })

  it('marks a scheduled trip as dispatched when a matching prediction exists', () => {
    const schedules = { data: [makeSchedule(TRIP_A)], included: [makeTrip(TRIP_A)] }
    const predictions = { data: [makePrediction(TRIP_A)], included: [makeTrip(TRIP_A)] }
    const vehicles = { data: [], included: [] }

    const { inbound } = mergeTripData(schedules, predictions, vehicles)
    expect(inbound).toHaveLength(1)
    const train = inbound[0]
    expect(train.isDispatched).toBe(true)
    expect(train.isStaged).toBe(false)
    expect(train.predictedTime).toBeInstanceOf(Date)
  })

  it('marks a scheduled trip as staged when a vehicle is assigned but no prediction exists', () => {
    const schedules = { data: [makeSchedule(TRIP_A)], included: [makeTrip(TRIP_A)] }
    const predictions = { data: [], included: [] }
    const vehicles = { data: [makeVehicle(TRIP_A)], included: [makeStop('stop-1')] }

    const { inbound } = mergeTripData(schedules, predictions, vehicles)
    const train = inbound[0]
    expect(train.isDispatched).toBe(false)
    expect(train.isStaged).toBe(true)
    expect(train.vehicle).not.toBeNull()
  })

  it('surfaces an ADDED trip from predictions as a dispatched train with no scheduledTime', () => {
    const schedules = { data: [], included: [] }
    const predictions = {
      data: [makePrediction(ADDED_C)],
      included: [makeTrip(ADDED_C, 0, 'Heath Street')],
    }
    const vehicles = { data: [], included: [] }

    const { inbound } = mergeTripData(schedules, predictions, vehicles)
    expect(inbound).toHaveLength(1)
    const train = inbound[0]
    expect(train.id).toBe(ADDED_C)
    expect(train.isDispatched).toBe(true)
    expect(train.isStaged).toBe(false)
    expect(train.scheduledTime).toBeNull()
    expect(train.predictedTime).toBeInstanceOf(Date)
    expect(train.headsign).toBe('Heath Street')
  })

  it('surfaces an ADDED trip from vehicles as a staged train when no prediction exists', () => {
    const schedules = { data: [], included: [] }
    const predictions = { data: [], included: [] }
    const vehicles = {
      data: [makeVehicle(ADDED_D, 'stop-1', '3850')],
      included: [makeStop('stop-1', 'Ball Square'), makeTrip(ADDED_D, 1, 'Medford/Tufts')],
    }

    const { outbound } = mergeTripData(schedules, predictions, vehicles)
    expect(outbound).toHaveLength(1)
    const train = outbound[0]
    expect(train.id).toBe(ADDED_D)
    expect(train.isDispatched).toBe(false)
    expect(train.isStaged).toBe(true)
    expect(train.scheduledTime).toBeNull()
    expect(train.predictedTime).toBeNull()
    expect(train.vehicle.label).toBe('3850')
    expect(train.vehicle.stopName).toBe('Ball Square')
  })

  it('does not duplicate a trip that appears in both schedules and predictions', () => {
    const schedules = { data: [makeSchedule(TRIP_A)], included: [makeTrip(TRIP_A)] }
    const predictions = { data: [makePrediction(TRIP_A)], included: [makeTrip(TRIP_A)] }
    const vehicles = { data: [], included: [] }

    const { inbound } = mergeTripData(schedules, predictions, vehicles)
    expect(inbound).toHaveLength(1)
    expect(inbound[0].isDispatched).toBe(true)
  })

  it('splits trains into inbound and outbound by directionId', () => {
    const schedules = {
      data: [makeSchedule(TRIP_A, '2024-01-01T10:00:00-05:00', 0), makeSchedule(TRIP_B, '2024-01-01T10:05:00-05:00', 1)],
      included: [makeTrip(TRIP_A, 0), makeTrip(TRIP_B, 1)],
    }
    const predictions = { data: [], included: [] }
    const vehicles = { data: [], included: [] }

    const { inbound, outbound } = mergeTripData(schedules, predictions, vehicles)
    expect(inbound).toHaveLength(1)
    expect(outbound).toHaveLength(1)
    expect(inbound[0].id).toBe(TRIP_A)
    expect(outbound[0].id).toBe(TRIP_B)
  })
})
