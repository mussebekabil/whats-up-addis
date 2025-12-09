import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Event schemas
const eventBaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required').max(255),
  venue: z.string().min(2, 'Venue is required').max(255),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  price: z
    .number()
    .nonnegative('Price must be non-negative')
    .optional()
    .nullable(),
  categoryId: z.string().uuid('Invalid category ID'),
  tags: z.array(z.string()).optional(),
});

export const createEventSchema = eventBaseSchema.refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const updateEventSchema = eventBaseSchema.partial();

export const eventFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  endDateGte: z.string().datetime().optional(),
  endDateLt: z.string().datetime().optional(),
  search: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  isFree: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Crawler source schemas
export const createCrawlerSourceSchema = z.object({
  name: z.string().min(2).max(255),
  baseUrl: z.string().url(),
  scraperType: z.string().min(2).max(50),
  isActive: z.boolean().default(true),
});

export const updateCrawlerSourceSchema = createCrawlerSourceSchema.partial();

// Comment schemas
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment is too long'),
  parentCommentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment is too long'),
});

// Rating schemas
export const createRatingSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

export const updateRatingSchema = createRatingSchema;

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateCrawlerSourceInput = z.infer<
  typeof createCrawlerSourceSchema
>;
export type UpdateCrawlerSourceInput = z.infer<
  typeof updateCrawlerSourceSchema
>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type UpdateRatingInput = z.infer<typeof updateRatingSchema>;
