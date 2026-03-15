import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface CompanyRequest extends Request {
  company?: {
    id: string;
    email: string;
  };
}

interface JWTPayload {
  id: string;
  email: string;
}

export function companyAuth(
  req: CompanyRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const decoded = jwt.verify(token, secret) as JWTPayload;

    req.company = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
