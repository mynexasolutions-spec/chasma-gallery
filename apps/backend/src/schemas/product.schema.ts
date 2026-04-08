import { z } from 'zod';

// Helper: accept empty string and coerce to null (for optional UUID fields from HTML forms)
const optionalUuid = z.union([
  z.string().uuid(),
  z.literal(''),
  z.null(),
]).transform(v => v === '' ? null : v).optional().default(null);

// Helper: accept string numbers from forms and coerce to number
const coerceNumber = z.union([z.number(), z.string().transform(v => Number(v))]).pipe(z.number());
const coercePositiveNumber = z.union([z.number(), z.string().transform(v => Number(v))]).pipe(z.number().positive('Must be positive'));
const coerceInt = z.union([z.number(), z.string().transform(v => Number(v))]).pipe(z.number().int().min(0));

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  sku: z.string().max(100).optional().default(''),
  type: z.enum(['simple', 'variable']).default('simple'),
  description: z.string().optional().default(''),
  short_description: z.string().max(500).optional().default(''),
  price: coercePositiveNumber,
  sale_price: z.union([coerceNumber, z.literal(''), z.null()]).transform(v => (v === '' || v === null || v === 0) ? null : v).optional().default(null),
  stock_quantity: coerceInt.default(0),
  stock_status: z.enum(['in_stock', 'out_of_stock', 'backorder']).default('in_stock'),
  manage_stock: z.boolean().default(true),
  category_id: optionalUuid,
  brand_id: optionalUuid,
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial().required({ name: true, slug: true, price: true });
