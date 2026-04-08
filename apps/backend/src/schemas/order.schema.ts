import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], {
    error: 'Invalid status. Must be: pending, processing, shipped, delivered, cancelled, or refunded',
  }),
});

export const updatePaymentStatusSchema = z.object({
  payment_status: z.enum(['unpaid', 'paid', 'refunded'], {
    error: 'Invalid payment status. Must be: unpaid, paid, or refunded',
  }),
});
