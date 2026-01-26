# Supabase Integration & Tour Management System

This project uses Supabase as the backend for the Tour Management System.

## Database Schema

The following tables are created in the public schema:

### `tours`
Stores the main tour information.
- `id`: UUID (Primary Key)
- `name`: Text
- `url_slug`: Text (Unique)
- `destination`: Text
- `region`: Text
- `country`: Text
- `category`: Text
- `status`: 'Published' | 'Draft'
- `price`: Numeric
- `duration`: Integer (number of days)
- `difficulty`: 'Easy' | 'Moderate' | 'Challenging' | 'Strenuous'
- `tour_type`: Integer (code 1–9)
- `description`: Text
- `meta_title`: Text
- `meta_description`: Text
- `featured_image`: Text (URL)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### `tour_highlights`
- `id`: UUID
- `tour_id`: UUID (FK to tours)
- `icon`: Text
- `text`: Text

### `seasonal_prices`
- `id`: UUID
- `tour_id`: UUID (FK to tours)
- `start_date`: Date
- `end_date`: Date
- `price`: Numeric
- `label`: Text

### `group_discounts`
- `id`: UUID
- `tour_id`: UUID (FK to tours)
- `min_guests`: Int
- `max_guests`: Int
- `discount_percentage`: Numeric

*(Additional tables: `tour_gallery_images`, `itineraries`, `tour_inclusions`, `tour_faqs`)*

## API Endpoints (Service Layer)

Interactions are handled via `lib/services/tourService.ts` using the Supabase JS Client.

### Get All Tours
- **Function**: `TourService.getAllTours()`
- **Returns**: `Promise<Tour[]>`
- **Example Response**:
```json
[
  {
    "id": "uuid...",
    "name": "Everest Base Camp",
    "price": 1500,
    "status": "Published"
    // ...
  }
]
```

### Get Tour by ID
- **Function**: `TourService.getTourById(id)`
- **Returns**: `Promise<Tour>` (includes relations like highlights, prices)

### Create Tour
- **Function**: `TourService.createTour(tourData)`
- **Input**: `Partial<Tour>`
- **Returns**: Created `Tour` object

### Update Tour
- **Function**: `TourService.updateTour(id, updates)`
- **Input**: `id`, `Partial<Tour>`
- **Returns**: Updated `Tour` object

### Delete Tour
- **Function**: `TourService.deleteTour(id)`
- **Returns**: `void`

## Local Development Setup

1.  **Environment Variables**:
    Ensure `.env.local` contains your Supabase credentials:
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

2.  **Database Migration**:
    The schema is defined in `supabase/migrations/20240101000000_initial_schema.sql`.
    If setting up a new Supabase project, run this SQL in the Supabase SQL Editor.

3.  **Running the App**:
    ```bash
    npm run dev
    ```

4.  **Running Tests**:
    ```bash
    npm install -D vitest
    npx vitest run
    ```
