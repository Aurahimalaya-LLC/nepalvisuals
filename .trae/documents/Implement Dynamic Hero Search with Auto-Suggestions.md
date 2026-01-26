I will implement the enhanced search functionality by creating a new `HeroSearch` component and integrating it into the Home Page.

### 1. Create Debounce Hook
**File:** `lib/hooks/useDebounce.ts`
- Implement a `useDebounce` hook to delay API calls while typing, optimizing performance (300ms delay).

### 2. Create HeroSearch Component
**File:** `components/home/HeroSearch.tsx`
- **Functionality:**
    -   **State Management:** Handle search query, suggestions list, loading state, and UI visibility (open/closed).
    -   **API Integration:** Fetch real-time suggestions using `TourService.getAllTours` filtered by the search term.
    -   **Keyboard Navigation:** Support Arrow Up/Down to navigate suggestions and Enter to select.
    -   **Mouse Interaction:** Click-to-select functionality.
    -   **Responsive Design:** Adapt the dropdown and input for mobile and desktop.
    -   **Accessibility:** Add ARIA labels (`combobox`, `listbox`, `option`) for screen readers.
- **UI Design:**
    -   Match the existing "glassmorphism" style (`bg-white/10 backdrop-blur-md`).
    -   Show a loading spinner inside the input or dropdown.
    -   Display "No results found" when applicable.
    -   Highlight the active suggestion.

### 3. Update Home Page
**File:** `pages/HomePage.tsx`
- Replace the existing static HTML search bar with the new `<HeroSearch />` component.

### 4. Verification
- **Manual Verification:** Verify search behavior, debounce, keyboard navigation, and responsive layout.
- **Unit Tests:** Create `tests/components/HeroSearch.test.tsx` to validate:
    -   Rendering and initial state.
    -   Input handling and debounce.
    -   Suggestion rendering.
    -   Keyboard navigation.
