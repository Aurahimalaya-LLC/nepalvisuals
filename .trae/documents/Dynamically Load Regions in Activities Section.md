**Overview**

* Replace the hardcoded “Activities” region cards in the homepage section with data from the backend.

* Use the existing Supabase-powered region service as the data source, adding a dedicated hook for clean separation of fetching and presentation.

* Provide loading, error, sorting, and live refresh capabilities, with responsive and accessible UI.

**Current Implementation (References)**

* Activities section (hardcoded): [HomePage.tsx](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/pages/HomePage.tsx) — region cards under the “Activities” header [HomePage.tsx:L98-L151](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/pages/HomePage.tsx#L98-L151)

* Static region database for region detail pages: [RegionPage.tsx](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/pages/RegionPage.tsx)

* Supabase region service used in admin: [regionService.ts](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/lib/services/regionService.ts), client: [supabaseClient.ts](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/lib/supabaseClient.ts)

* Admin region usage examples: [AdminRegionsPage.tsx](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/pages/AdminRegionsPage.tsx), [AdminRegionEditorPage.tsx](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/pages/AdminRegionEditorPage.tsx)

**Data Layer (Separation of Concerns)**

* Create a new hook: `useRegionsData()` in `lib/hooks/useRegionsData.ts`.

  * `regions`, `loading`, `error` state.

  * `fetchRegions` async function: calls `regionService.getAllRegions()` and sorts alphabetically by default.

  * Error handling: try/catch, surface a user-friendly `error.message`.

  * Loading state: set while fetching.

  * Automatic refresh support: subscribe to Supabase realtime changes on `regions` (insert/update/delete) and re-fetch or patch state.

  * Expose `refresh()` to allow manual retries and programmatic refresh.

**Presentation Layer**

* Refactor Activities section in [HomePage.tsx](file:///Users/krsna/Desktop/Ai_project/nepal-visuals-trekking/pages/HomePage.tsx):

  * Replace static region cards with a map over `regions` from `useRegionsData()`.

  * Show a skeleton/placeholder carousel while `loading` (e.g., gray boxes with shimmer).

  * Show an inline error banner with a Retry button when `error` is set.

  * Each card displays: region name, optional short description, optional trips count if available, image (`featured_image` fallback placeholder), and CTA “Explore region”.

  * Link to `/region/{slug}` or `/region/{id}` depending on available fields; prefer slug.

**Sorting**

* Default: alphabetical by `name` (case-insensitive).

* Add UI control (optional, simple dropdown) to select sort order; initial requirement is alphabetical, so implement basic sorting first and keep the hook extensible.

**Automatic Refresh**

* Supabase realtime: `supabase.channel('regions')` with `postgres_changes` on `regions` table.

* On insert/update/delete, re-run `fetchRegions()` or update the local list (depending on complexity).

* Debounce/throttle refresh to avoid flicker on multiple batched changes.

**Loading & Error UX**

* Loading: skeleton cards matching card dimensions to avoid layout shift; carousel remains horizontally scrollable.

* Error: accessible alert with role="alert", clear message, and Retry button calling `refresh()`.

**Accessibility & Responsiveness (WCAG)**

* Semantic markup: section with aria-label (e.g., "Activities"), headings remain `<h2>`.

* Alt text present for all region images.

* Keyboard-accessible carousel: ensure focusable cards and CTA; maintain visible focus ring.

* Color contrast: text colors meet ≥4.5:1 on backgrounds; CTAs use primary brand color with sufficient contrast against white/dark backgrounds.

* Responsive layout: preserve current flex/grid responsive classes; ensure card min-widths adapt for small screens.

**Best Practices**

* TypeScript: Define `Region` type aligned with backend fields (id, name, slug, featured\_image, description, etc.).

* Avoid inline fetching in components; centralize in the hook.

* Pure presentation component for region cards; no data fetching inside the card component.

**Testing & Verification**

* Manual: simulate slow network (Chrome dev tools), verify loading skeleton, error retry, and live updates when a new region is added via admin.

* Cross-browser smoke checks: Chrome, Firefox, Safari; mobile Safari/Chrome on iOS/Android.

* Unit: simple tests for the hook’s sorting and error handling if test framework exists.

**Deliverables**

* `lib/hooks/useRegionsData.ts` implemented with fetch, sort, error/loading, realtime refresh.

* Updated `pages/HomePage.tsx` Activities section to consume the hook and render dynamic region cards with accessible, responsive UI.

* Minor utilities/types additions if needed (Region type), documented in code where appropriate.

