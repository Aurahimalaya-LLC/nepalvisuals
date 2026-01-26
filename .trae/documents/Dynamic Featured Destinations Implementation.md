# Implementation Plan: Dynamic Featured Destinations

I will implement a dynamic "Featured Destinations" section driven by a new Supabase table, replacing the hardcoded content on the homepage.

## 1. Database Schema (Supabase)
Create a new migration file `supabase/migrations/20260107000017_featured_destinations.sql` to define the `featured_destinations` table.
*   **Columns**:
    *   `id` (UUID, PK)
    *   `name` (Text, Title)
    *   `description` (Text, Overview)
    *   `image_url` (Text)
    *   `price` (Text, optional, for "Starting from $X")
    *   `duration` (Text, optional, e.g., "14 Days")
    *   `rating` (Numeric, optional, e.g., 4.9)
    *   `link_url` (Text, internal route link)
    *   `display_order` (Integer, for sorting)
    *   `is_active` (Boolean)
*   **Security**: Enable Row Level Security (RLS). Allow public read access; restrict write access to authenticated admins.

## 2. Service Layer
Create `lib/services/featuredDestinationService.ts` to handle data fetching.
*   Define TypeScript interface `FeaturedDestination`.
*   Implement `getFeaturedDestinations()` method with error handling and ordering.

## 3. UI Implementation
Create a new component `components/home/FeaturedDestinations.tsx`.
*   **Features**:
    *   Fetch data on mount using the service.
    *   **Loading State**: Display skeleton loaders while fetching.
    *   **Error State**: specific error UI if fetch fails.
    *   **Display**: Grid layout using existing Tailwind styles (Glassmorphism cards).
    *   **Responsiveness**: Mobile-first grid (1 col -> 2 col -> 3 col).
*   **Integration**: Update `pages/HomePage.tsx` to replace the hardcoded "Featured Destinations" section with this new component.

## 4. Testing
Create `components/home/FeaturedDestinations.test.tsx`.
*   Unit tests to verify:
    *   Loading state rendering.
    *   Successful data rendering (mocked Supabase response).
    *   Error handling.

## 5. Verification
*   Run the migration (simulated via SQL execution or file creation for future runs).
*   Seed initial data so the section isn't empty.
*   Verify the UI in the browser preview.
