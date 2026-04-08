import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * Returns 400 with field-level errors on failure.
 */
const validate = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = result.data;
  next();
};

export default validate;

