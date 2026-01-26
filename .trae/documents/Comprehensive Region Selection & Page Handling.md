## Overview
Implement a robust, accessible region selection and page handling system that verifies region existence, routes to existing pages, or renders dynamic pages when missing. Align with current React + React Router v6 hash-based routing, Supabase-backed data, Tailwind styling, and Vitest.

## Architecture Alignment
- Keep HashRouter and route pattern `/region/:regionName`.
- Use existing Supabase RegionService and hooks as data source.
- Avoid new heavy libraries (Redux/SWR); implement SWR-like behavior with custom hooks and Context.

## Region Click Handling
- Add click handlers on region cards/links in HomePage to:
  - Extract identifier (slug) from element `data-region`/link href.
  - Normalize to slug: `name.toLowerCase().replace(/\s+/g, '-')`.
  - Call `RegionService.exists(slug)` to verify.
- Preserve existing navigation via React Router; fall back to prevented navigation if 404.
- Accessibility: ensure clickable elements remain proper links/buttons with roles/aria-labels.

## Existence Verification
- Add `RegionService.exists(regionSlug)` using Supabase query (fast `select('id').eq('slug')`).
- Provide `useRegionExists(regionSlug)` hook returning `{ exists, loading, error }`.
- Use optimistic navigation with guard: pre-verify on click; if exists, push; if not, render dynamic page creation flow.

## Routing & Navigation
- Lazy-load RegionPage via `React.lazy(() => import('./pages/RegionPage'))` with `<Suspense>` for code-splitting.
- Continue using path `/region/:regionName` with `Route` element.
- Pass essentials via route params; supply rich data via Context (RegionContext) to avoid oversized URLs.
- Maintain history via `navigate('/region/'+slug, { replace: false, state })`.

## New Region Page Creation (404 case)
- Render a dynamic RegionBuilder page composed at runtime:
  - Hero section with `${region_name}` styled header (Tailwind, same scale).
  - Collapsible markdown description (reuse RichTextEditor parsing or a small markdown renderer if already present).
  - Interactive map (Leaflet/Mapbox)
    - If map lib already present: reuse
    - If not: defer map to a lightweight placeholder with coordinates from Supabase when available.
  - Attraction cards grid: images, rating stars (reuse existing card patterns).
  - Charts (D3.js/Chart.js): prefer a small wrapper; if no chart lib present, render numeric stats with accessible progress bars; chart lib addition gated.
- Auto-register route is not required in React Router; instead, render the RegionBuilder for invalid slugs under the same route.
- Components are lazy-loaded and code-split.

## State Management & SWR
- RegionContext: cache region list and per-region details (Map keyed by slug).
- Hooks:
  - `useRegionsData` (existing): source of cached list.
  - `useRegionDetails(slug)`: returns cached details; triggers revalidate in background.
- SWR-like behavior:
  - Serve cached data immediately; `refresh()` re-fetches in background and updates.
  - Prefetch on hover using `RegionContext.prefetch(slug)`.

## Performance
- Prefetch region data on card hover (`onMouseEnter`) to reduce navigation latency.
- Skeleton loaders for RegionPage sections (title, stats, cards) using Tailwind shimmer classes (existing patterns in HomePage).
- Optimize lazy imports with magic comments where applicable (Vite supports dynamic chunk names).

## Error Handling
- 404 view for invalid regions under `/region/:regionName`.
- Retry with exponential backoff in RegionService for transient errors (reuse `retryUtils` if present).
- Fallback UIs: friendly error banners with Retry button; aria-live for announcements.

## Analytics & Tracking
- Analytics adapter (`AnalyticsService`): GA/Amplitude integration behind environment flags.
- Track events on clicks and navigation:
  - `region_click` (id, click coords, timestamp)
  - `region_page_open` (existing/new)
  - Performance metrics via Performance API:
    - page load, API response times, render durations
- No secrets in repo; rely on env for keys. If absent, log to console.

## Quality Assurance
- Unit tests (Vitest + RTL):
  - Click handling extracts slug, existence check branches (200/404).
  - Lazy-loaded routing renders Suspense fallback and then page.
  - Error paths: network failure shows retry.
- E2E tests (Playwright):
  - Existing region happy path: hover prefetch → click → page renders with content.
  - New region flow: click invalid slug → RegionBuilder renders all sections.
  - Error scenarios: simulate API 500; verify retries and fallbacks.
- Cross-browser via Playwright projects; responsive snapshots at 320px.

## Accessibility & Design System
- WCAG AA:
  - Keyboard navigation for cards; enter/space activates.
  - Proper roles (`link`, `button`), aria-labels for interactive elements.
  - aria-live for loading and error updates.
- Maintain Tailwind palette, typography scale, spacing, dark mode classes used across pages.

## Deliverables
- Services & Hooks: `RegionService.exists`, `useRegionExists`, `useRegionDetails`, RegionContext.
- UI: click handlers on HomePage cards; lazy `RegionPage`; dynamic RegionBuilder for 404.
- Analytics: `AnalyticsService` adapter; event hooks in click/navigation.
- Tests: unit + e2e suites.
- Docs: JSDoc/TSDoc on new modules; API endpoint doc updates; Storybook entries (if Storybook present—otherwise a plan to add minimal stories later).

## Rollout Steps
1. Create RegionContext and hooks; wire prefetch on hover.
2. Implement `exists` API in RegionService.
3. Add click handling guards on HomePage cards.
4. Switch RegionPage to lazy load with Suspense.
5. Implement RegionBuilder dynamic sections and lazy child components.
6. Integrate AnalyticsService with safe fallbacks.
7. Add unit and e2e tests; configure Playwright projects.
8. Add documentation and code comments; verify accessibility.

Please confirm and I’ll proceed to implementation and testing in the codebase.