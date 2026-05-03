import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { hashPassword, comparePassword, generateToken, sendResponse } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const signup = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      throw new AppError(400, 'Email, password, and name are required');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError(400, 'User already exists with this email');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role: 'MEMBER'
      }
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MEMBER'
    });

    res.status(201).json(
      sendResponse(true, 'User created successfully', {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      })
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Signup failed', undefined, error.message));
    }
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'MEMBER'
    });

    res.status(200).json(
      sendResponse(true, 'Login successful', {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      })
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Login failed', undefined, error.message));
    }
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.status(200).json(sendResponse(true, 'Profile retrieved', user));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to get profile', undefined, error.message));
    }
  }
};
