import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken, extractToken } from '../utils/helpers';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req.headers.authorization || '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      error: 'Unauthorized'
    });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'Unauthorized'
    });
  }

  req.user = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };

  next();
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
      error: 'Unauthorized'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can access this resource',
      error: 'Forbidden'
    });
  }

  next();
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req.headers.authorization || '');

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role
      };
    }
  }

  next();
};
