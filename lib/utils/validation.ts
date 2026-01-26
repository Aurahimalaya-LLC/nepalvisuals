import { z } from 'zod';

export const tourSchema = z.object({
    name: z.string().min(5, 'Title must be at least 5 characters'),
    url_slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    price: z.number().min(0, 'Price cannot be negative'),
    duration: z.union([z.string(), z.number()]).transform((val) => Number(val)).refine((val) => val > 0 && val <= 365, 'Duration must be between 1 and 365 days'),
    difficulty: z.enum(['Easy', 'Moderate', 'Challenging', 'Strenuous']),
    status: z.enum(['Draft', 'Published']),
    region: z.string().min(1, 'Region is required'),
    country: z.string().min(1, 'Country is required'),
});

export const departureSchema = z.object({
    start_date: z.string().refine((date) => new Date(date) > new Date(), 'Start date must be in the future'),
    end_date: z.string(),
    price: z.number().min(0),
    capacity: z.number().min(1)
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
});

export const regionSchema = z.object({
    name: z.string().min(3, 'Region name must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['Draft', 'Published']),
    zoom_level: z.number().min(1).max(20).optional(),
});
