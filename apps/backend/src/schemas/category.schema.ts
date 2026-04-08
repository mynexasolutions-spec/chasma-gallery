import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  description: z.string().optional().default(''),
  parent_id: z.string().uuid().nullable().optional().default(null),
});

export const updateCategorySchema = createCategorySchema.partial().required({ name: true, slug: true });
