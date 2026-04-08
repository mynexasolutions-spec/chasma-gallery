import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '@ecommerce/shared-types';

export interface AuthRequest extends Request {
  user?: Partial<User>;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as Partial<User>;
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;
  if (!token) {
    return next();
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as Partial<User>;
  } catch (err) {
    // Ignore invalid tokens for optional endpoints
  }
  next();
};

export const authorize = (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role as string)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};
