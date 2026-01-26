## Root Cause Analysis
- Review current publish flow in AdminTrekEditorPage and TourService
- Validate if `published_at` column exists and is used consistently
- Confirm AdminToursPage filters (status/category) actually affect `getAllTours`
- Inspect DB triggers: only audit triggers present, no publish hook

## Publish Transition Logic
- Update service logic so status transitions set timestamps:
  - When status changes to Published → set `published_at = now()`
  - When status changes to Draft → clear `published_at = null`
- Ensure update path only writes valid schema fields and avoids joined fields

## API & CRUD Synchronization
- Extend `TourService.getAllTours` to support `status` and `category` filters server-side
- Update AdminToursPage to pass status/category to `getAllTours` and remove local workarounds
- Confirm pagination and ordering remain consistent; default order by `published_at` desc when status is Published

## Editor Integration
- In AdminTrekEditorPage:
  - On publish request, explicitly set `published_at` before calling service
  - On revert to Draft, explicitly clear `published_at`
  - Keep validation via `tourSchema` and add friendly, actionable error messages
  - Log failures with contextual payload (excluding images/secrets), and surface toasts

## Error Handling & Logging
- Add structured error logs in TourService.create/update with operation, tour id, fields changed, and status transition
- Map common Supabase error codes to user-friendly messages
- Introduce retry for transient failures (e.g., network), with backoff

## Data Validation Before Appearing in CRUD
- Confirm published tours meet criteria in `tourSchema` (name, slug, price≥0, duration in 1–365, difficulty enum, region, country)
- Add a secondary guard that prevents setting Published if required fields are missing, and clearly displays what’s missing

## Testing Strategy
- Unit tests:
  - Status change: Draft→Published sets `published_at`, Draft clearing it
  - Service filters: `getAllTours` returns correct rows for status/category
  - Validation failures block publish and show error
- Bulk updates:
  - Simulate batch publishes (array of ids): ensure all set `published_at` and status
- Edge cases:
  - Missing required fields, invalid duration/price, empty region/country
- CRUD visibility:
  - After publish, AdminToursPage shows tour under Published filter; Draft disappears from Published

## Database & Migrations
- Verify migration `20260108000000_add_published_at_to_tours.sql` applied in all envs
- If absent, apply migration safely with `IF NOT EXISTS` already present

## Documentation
- Update service API docs to include status/category filters and publish semantics
- Editor docs: describe publish requirements, error states, and remediation steps
- Record resolution in internal runbook with before/after behavior

## Rollout Steps
1. Implement `published_at` set/clear in TourService.update
2. Add `status`/`category` filters to `getAllTours`
3. Wire AdminToursPage to use the filters
4. Update AdminTrekEditorPage to set/clear `published_at`
5. Add error handling and structured logging
6. Write unit tests and bulk update tests; run suite
7. Validate in staging with real data; confirm CRUD shows changes
8. Ship documentation updates