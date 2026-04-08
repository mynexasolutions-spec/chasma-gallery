import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  type: z.enum(['percentage', 'fixed'], { error: 'Type must be percentage or fixed' }),
  value: z.number().positive('Value must be positive'),
  usage_limit: z.number().int().positive().nullable().optional().default(null),
  expires_at: z.string().transform(v => v ? (v.includes('T') ? v : `${v}T23:59:59Z`) : null).nullable().optional().default(null),
  is_active: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema;
