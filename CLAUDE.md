# Claude Code — project rules

## On every commit / push

1. **CHANGELOG.md** — always add an entry under `## [Unreleased]` describing what changed. Follow the Keep a Changelog format (Added / Changed / Fixed / Removed). Use today's date when cutting a release entry.

2. **README.md** — update if the change affects anything documented there: project layout, feature list, API data model, train source type table, or running instructions. Don't update it for pure refactors or test-only changes that have no user-visible effect.

3. **Tests** — add or update a test that locks down the new behaviour whenever possible. Prefer unit tests for pure logic (utilities, data-merging functions). If the change is UI-only and can't be meaningfully unit-tested, say so explicitly rather than skipping silently.

## Code conventions

- No comments unless the *why* is non-obvious (hidden constraint, workaround, subtle invariant).
- No trailing summaries at the end of responses — the diff speaks for itself.
- Prefer editing existing files over creating new ones.
- Keep fetch functions in `src/utils/mbta.js`; keep data-merging and polling logic in `src/hooks/useMBTA.js`.
