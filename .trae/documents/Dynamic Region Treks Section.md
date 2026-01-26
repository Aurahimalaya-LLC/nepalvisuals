## Overview
Replace the placeholder "Available Treks" section in `RegionPage.tsx` with a dynamic `RegionTreksSection` component. This component will fetch and display tours filtered by the current region using the existing `TourService`.

## Data Fetching Strategy
- Create a new hook `useToursByRegion(regionName)`:
  - Uses `TourService.getToursByRegion(regionName)` (which we just added).
  - Returns `{ tours, loading, error, refresh }`.
  - Handles the case where `regionName` is undefined or empty.
  - Updates automatically when `regionName` changes.

## UI Component: `RegionTreksSection`
- Props: `{ regionName: string }`
- State: Derived from `useToursByRegion`.
- Render:
  - **Loading:** 3-card skeleton grid (matching existing styles).
  - **Error:** Friendly error message with a "Retry" button.
  - **Empty:** "No treks available yet" message (styled like the current placeholder).
  - **Data:** Grid of `TrekCard` components.
    - Reuse the existing `TrekCard` definition in `RegionPage.tsx` or extract it to a shared component if it's not exported.
    - *Correction:* `TrekCard` is currently defined locally in `RegionPage.tsx`. I will extract it to `components/tour/TrekCard.tsx` to make it reusable and clean up `RegionPage`.

## Integration
- In `RegionPage.tsx`:
  - Import `RegionTreksSection`.
  - Replace the hardcoded `<section>` block (lines 110-124) with `<RegionTreksSection regionName={region.name} />`.
  - Ensure the `region` object is available (it is, from `useRegionsData`).

## Error Handling & Edge Cases
- Invalid Region: The hook handles empty input safely.
- API Failures: The component displays an error banner within the section, preventing page crash.
- No Tours: Displays the empty state card.

## Testing
- Unit tests for `RegionTreksSection`:
  - Verify loading state renders skeletons.
  - Verify error state renders retry button.
  - Verify empty state renders message.
  - Verify data state renders correct number of cards with correct details.
  - Mock `useToursByRegion` to control states.

## Step-by-Step Implementation
1.  Extract `TrekCard` from `RegionPage.tsx` to `components/tour/TrekCard.tsx`.
2.  Create `lib/hooks/useToursByRegion.ts`.
3.  Create `components/tour/RegionTreksSection.tsx` consuming the hook and `TrekCard`.
4.  Update `RegionPage.tsx` to use the new section.
5.  Add tests in `tests/components/RegionTreksSection.test.tsx`.