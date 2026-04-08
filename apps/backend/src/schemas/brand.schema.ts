import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
});

export const updateBrandSchema = createBrandSchema;
