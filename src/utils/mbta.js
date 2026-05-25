const BASE = 'https://api-v3.mbta.com'
const API_KEY = import.meta.env.VITE_MBTA_API_KEY

export const ROUTE_ID = 'Green-E'
export const DEFAULT_STOP_ID = 'place-mgngl'

// Ordered Medford/Tufts → Heath Street (direction 0 = toward downtown/Heath St)
export const STATIONS = [
  { id: 'place-mdftf', name: 'Medford/Tufts' },
  { id: 'place-balsq', name: 'Ball Square' },
  { id: 'place-mgngl', name: 'Magoun Square' },
  { id: 'place-gilmn', name: 'Gilman Square' },
  { id: 'place-esomr', name: 'East Somerville' },
  { id: 'place-lech',  name: 'Lechmere' },
  { id: 'place-spmnl', name: 'Science Park/West End' },
  { id: 'place-north', name: 'North Station' },
  { id: 'place-haecl', name: 'Haymarket' },
  { id: 'place-gover', name: 'Government Center' },
  { id: 'place-pktrm', name: 'Park Street' },
  { id: 'place-boyls', name: 'Boylston' },
  { id: 'place-armnl', name: 'Arlington' },
  { id: 'place-coecl', name: 'Copley' },
  { id: 'place-prmnl', name: 'Prudential' },
  { id: 'place-symcl', name: 'Symphony' },
  { id: 'place-nuniv', name: 'Northeastern University' },
  { id: 'place-mfa',   name: 'Museum of Fine Arts' },
  { id: 'place-lngmd', name: 'Longwood Medical Area' },
  { id: 'place-brmnl', name: 'Brigham Circle' },
  { id: 'place-fenwd', name: 'Fenwood Road' },
  { id: 'place-mispk', name: 'Mission Park' },
  { id: 'place-rvrwy', name: 'Riverway' },
  { id: 'place-bckhl', name: 'Back of the Hill' },
  { id: 'place-hsmnl', name: 'Heath Street' },
]

function authParam() {
  return API_KEY ? `&api_key=${API_KEY}` : ''
}

export async function fetchPredictions(stopId) {
  const url = `${BASE}/predictions?filter[stop]=${stopId}&filter[route]=${ROUTE_ID}&include=trip,vehicle${authParam()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Predictions fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchSchedules(stopId) {
  const url = `${BASE}/schedules?filter[stop]=${stopId}&filter[route]=${ROUTE_ID}&filter[min_time]=04:00:00&include=trip${authParam()}`
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

export async function fetchTripSchedules(tripId) {
  const url = `${BASE}/schedules?filter[trip]=${tripId}&include=stop${authParam()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Trip schedules fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchTripPredictions(tripId) {
  const url = `${BASE}/predictions?filter[trip]=${tripId}&include=stop${authParam()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Trip predictions fetch failed: ${res.status}`)
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
