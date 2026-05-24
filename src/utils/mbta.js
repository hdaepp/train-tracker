const BASE = 'https://api-v3.mbta.com'
const API_KEY = import.meta.env.VITE_MBTA_API_KEY

export const STOP_ID = 'place-mgngl'
export const ROUTE_ID = 'Green-E'

// Direction 0 = outbound (toward Heath St), Direction 1 = inbound (toward Medford/Tufts)
// But from Magoun Square's perspective, "inbound" to the rider means toward downtown.
// Green-E direction_id=0 goes toward the outer end (Medford/Tufts, away from downtown).
// We'll label by MBTA direction names fetched at startup, defaulting to these.
export const DIRECTION_NAMES = { 0: 'Outbound', 1: 'Inbound' }

function authParam() {
  return API_KEY ? `&api_key=${API_KEY}` : ''
}

export async function fetchPredictions() {
  const url = `${BASE}/predictions?filter[stop]=${STOP_ID}&filter[route]=${ROUTE_ID}&include=trip,vehicle${authParam()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Predictions fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchSchedules() {
  const now = new Date()
  // Fetch schedules for the next 3 hours
  const minTime = now.toTimeString().slice(0, 8)
  const later = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const maxTime = later.toTimeString().slice(0, 8)
  const url = `${BASE}/schedules?filter[stop]=${STOP_ID}&filter[route]=${ROUTE_ID}&filter[min_time]=${minTime}&filter[max_time]=${maxTime}&include=trip${authParam()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Schedules fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchVehicles() {
  const url = `${BASE}/vehicles?filter[route]=${ROUTE_ID}&include=stop${authParam()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Vehicles fetch failed: ${res.status}`)
  return res.json()
}

export function parseTime(isoString) {
  if (!isoString) return null
  return new Date(isoString)
}

export function formatTime(date) {
  if (!date) return '—'
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function minutesFromNow(date) {
  if (!date) return null
  return Math.round((date - new Date()) / 60000)
}
