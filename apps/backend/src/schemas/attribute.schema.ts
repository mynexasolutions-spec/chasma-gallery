import { z } from 'zod';

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
});

export const createAttributeValueSchema = z.object({
  value: z.string().min(1, 'Value is required').max(255),
});
