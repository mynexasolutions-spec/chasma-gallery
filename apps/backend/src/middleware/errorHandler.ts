import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`❌ [${req.method}] ${req.path} →`, err.stack || err.message);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;

  res.status(status).json({ success: false, message });
};

export default errorHandler;
