import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { ApiResponse, JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const sendResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    error,
  };
};

export const extractToken = (authHeader: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};
