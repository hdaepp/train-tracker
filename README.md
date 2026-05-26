# Green Line Tracker

A personal real-time tracker for the MBTA Green Line E branch, deployed at  
**https://hdaepp.github.io/train-tracker/**

---

## Why I built this

My usual station is Magoun Square, which is the third stop from the Medford/Tufts terminus. The MBTA doesn't publish live predictions for a trip until the train is dispatched — meaning actively en route and reporting location. For inbound trains at Magoun Square, that only happens about two minutes before the train arrives, which is too late to be useful.

The MBTA v3 API, however, exposes a lot more than just predictions. It publishes the full daily schedule, real-time vehicle positions and assignments, and trip-to-vehicle relationships. Piecing that data together makes it possible to answer questions the official app can't: *Is there a train sitting at the terminus right now that's assigned to my next trip? What block is it running today? Is it running late on its previous trip?*

This tracker is my attempt to surface that information clearly, indexed in a few different ways.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (test → build → deploy on push to `main`) |
| Data | MBTA v3 API (free, key optional but rate-limited without one) |
| Testing | Vitest + React Testing Library |
| Styling | Plain CSS (no framework) |

No router library — URL state is managed manually via `history.replaceState` to keep the bundle small and the navigation model simple.

---

## Project layout

```
src/
  App.jsx                     # Root: navigation state, renders active view
  App.css                     # All styles
  hooks/
    useMBTA.js                # Main data hook — fetches schedules, predictions,
                              #   and vehicles in parallel; merges into train objects;
                              #   polls every 30s
    useTripDetail.js          # Stop-by-stop itinerary for one trip; polls every 15s
    useBlockDetail.js         # Fetches schedules for all trips in a block in one request
    useStation.js             # Selected station — synced to URL (?station=) and localStorage
    useLayout.js              # Layout preference (auto/mobile/desktop) — synced to localStorage
  utils/
    mbta.js                   # All MBTA API fetch functions, STATIONS list, time helpers
    format.js                 # Shared pure utilities (deltaLabel)
  components/
    ViewSwitcher.jsx           # Live / Details tab bar
    TrainCard.jsx              # Single train card in the Live view
    HamburgerMenu.jsx          # Layout override dropdown
    views/
      MainView.jsx             # Live: next 5 upcoming trains per direction
      DetailsView.jsx          # Debug: full-day trip table with block and vehicle info
      TripDetailView.jsx       # Stop-by-stop itinerary for a selected trip
      BlockView.jsx            # All trips in a vehicle's block for the day
```

---

## Key features

### Three-tier train status

Most transit apps show two states: *scheduled* or *live*. This tracker surfaces a third:

| Status | Meaning | Display |
|---|---|---|
| **Scheduled** | Trip is in the timetable; no vehicle assigned yet | Grey, subdued |
| **Staged** | A vehicle has been assigned to the trip ID and is likely waiting at the terminus, but live predictions haven't started | White background, green-tinted text |
| **Dispatched** | The vehicle is en route and publishing live predictions | Green-tinted background |

The staged status is derived by cross-referencing the `/vehicles` endpoint (which shows all vehicles on the route and their current trip assignments) against the schedule. A vehicle sitting at Medford/Tufts assigned to an upcoming trip ID shows up as Staged even though no prediction exists yet.

### MBTA v3 API data model

Three endpoints are fetched in parallel on every poll:

- **`/schedules?filter[stop]=…`** — the full published timetable for today at the selected station. Returns every scheduled trip from start-of-service (`04:00:00`) onward.
- **`/predictions?filter[stop]=…`** — live arrival estimates. These only exist for trips that are currently dispatched (a vehicle is en route). Includes the trip and vehicle in the `included` payload.
- **`/vehicles?filter[route]=Green-E`** — all vehicles currently on the line, each with its current trip ID, current stop, and status (`STOPPED_AT` / `IN_TRANSIT_TO`).

These are merged by trip ID: for each scheduled trip, the hook attaches a prediction (if one exists) and a vehicle (if one is assigned). The result is the three-tier status model above.

### Block IDs — tracing a vehicle across the day

Each MBTA trip carries a `block_id` attribute that groups all trips a single physical vehicle runs in sequence across the service day. Two trips sharing a block ID will always be served by the same car.

This is exposed in two places:

1. **Debug view (Details tab)** — the Block column shows each trip's block ID, letting you see which scheduled runs are linked to the same vehicle.
2. **Trip detail header** — the block ID is a link that opens a Block View listing every trip in the block, sorted by departure time from origin, with start stop, end stop, and current status. The trip you navigated from is highlighted.

The "Where is my train?" link in the trip detail header uses the same block data: it searches all trips in the block for one that is currently dispatched or staged, and links directly to it. This answers the question "I know my train is supposed to run at 4pm — what trip is that vehicle on right now?"

**Note:** The MBTA API does not publish pre-assigned vehicle numbers. The block ID is the only pre-assignment signal available. The actual car number (the label painted on the vehicle) only appears in the API once the vehicle is staged or dispatched.

### Trip detail view

Clicking any train in the Live or Debug view opens a stop-by-stop itinerary for that trip showing scheduled time, live prediction, and delta (early/on-time/late) at every stop. Past stops are greyed out. The current vehicle position is marked with ▶. The station you're watching is marked with ★ and the view scrolls to it on open.

### Station selector

Covers all 25 Green Line E stops from Medford/Tufts to Heath Street. The selected station is encoded in the URL (`?station=place-mgngl`) and persisted in localStorage, so the page loads directly to your station.

### Responsive layout

Defaults to desktop two-column layout on wide screens (inbound and outbound side by side) and single-column on mobile, detected via `window.matchMedia`. A hamburger menu lets you override the automatic detection.

---

## Running locally

```bash
git clone https://github.com/hdaepp/train-tracker.git
cd train-tracker
npm install
npm run dev        # http://localhost:5173/train-tracker/
```

An MBTA API key is optional but recommended (raises rate limit from 20 to 1000 req/min). Register at [api-v3.mbta.com/register](https://api-v3.mbta.com/register), then:

```bash
echo "VITE_MBTA_API_KEY=your_key_here" > .env.local
```

```bash
npm test           # watch mode
npm run test:run   # single pass (used in CI)
npm run build      # production build to dist/
```
