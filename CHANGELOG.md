# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2026-06-01]

### Added
- Surface ADDED-trip trains (real-time-only trips with no published schedule entry) as Dispatched or Staged — fixes the bug where all trains showed as Scheduled when MBTA was running added service
- Status tab showing raw API response counts, ADDED-trip counts, and per-direction dispatched/staged/scheduled breakdown for at-a-glance debugging
- 9 unit tests for `mergeTripData` covering all train source type combinations (scheduled, staged, dispatched, ADDED dispatched, ADDED staged, deduplication, direction splitting)

### Changed
- `fetchVehicles` now includes trip data (`include=stop,trip`) so ADDED-staged trains have headsign and direction available
- `mergeTripData` exported for testability
- DetailsView `isPast` and anchor logic made null-safe for trains without a `scheduledTime`
- README: added train source type support table and documented ADDED-trip behaviour
- CLAUDE.md created with project rules for changelog, readme, and test coverage

## [2026-05-26]

### Added
- Block view showing all trips in the block
- Block ID line and "Where is my train?" link in trip detail header

### Changed
- Show block ID in trip detail header
- Rewrote README with full project documentation

## [2026-05-25]

### Added
- Vitest + React Testing Library test setup
- Debug view with trip/block/vehicle index and early/late delta labels
- Trip ID sticky header in trip detail

### Changed
- Replace favicon with tram icon; update page title
- Prefix trip ID with "Trip ID: " label in trip detail

## [2026-05-24] — Initial release

### Added
- Green Line E train tracker (initial commit)
- Live view showing next 5 upcoming trains
- Staged status for vehicles at terminus with clickable legend
- Station selector for all Green Line E stops
- Station persisted in URL as `?station=<stop-id>`
- Trip detail view with full stop itinerary
- Details tab with persistent fixed nav and jump-to-section buttons
- Responsive layout with hamburger menu override for desktop

### Fixed
- Correct inbound/outbound direction mapping in live view
- Resolve vehicle stop names from included API data
- Scroll to first dispatched row in details view, with fallback
- Scroll anchor priority: dispatched → staged → next scheduled

### Changed
- Swap dispatched/staged background colors; staged uses soft green text
- Remove Schedule tab (redundant with Details)
- Fill full browser width on desktop
