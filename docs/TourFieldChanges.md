# Tour Field Changes: Guide Language Removal and Numeric Fields

## Summary
- Removed `guide_language` from the tours form and database.
- Converted `tour_type` from text to integer code (1–9).
- Converted `duration` from text to integer (number of days).

## UI Changes
- Guide Language field removed from the Tour Editor.
- Tour Type is now a numeric input with constraints:
  - Min: 1
  - Max: 9
  - Step: 1
- Tour Duration is now a numeric input:
  - Positive integers only (days)
  - Min: 1

## Validation
- Inputs use numeric types with min/max constraints.
- Save actions are disabled if values are invalid.
- Inputs use `aria-invalid` and `aria-describedby` to maintain accessibility.

## Backend Schema Migration
Migration file: `supabase/migrations/20260106000010_update_tour_fields_numeric.sql`
- Drops `guide_language`.
- Converts `duration` to integer (extracts digits from text).
- Converts `tour_type` to integer with range constraint 1–9.
- Maps legacy values:
  - `Group` → `1`
  - `Private` → `2`

## API Layer
- `lib/services/tourService.ts` updated types:
  - `duration: number | null`
  - `tour_type: number | null`
  - Removed `guide_language`.

## Data Consistency
- Migration handles conversion of existing data.
- New records use the updated types consistently across UI and API.

## Deployment Notes
- Apply migration in Supabase SQL Editor or via CLI.
- Ensure environment variables are set before deploying.

