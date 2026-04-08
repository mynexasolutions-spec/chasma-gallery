import { z } from 'zod';

export const createUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'customer']).default('customer'),
});

export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'customer']),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'blocked'], {
    error: 'Status must be active or blocked',
  }),
});
