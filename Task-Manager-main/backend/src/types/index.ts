import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignedUserIds?: string[];
  dueDate?: string;
}

export interface ProjectInput {
  name: string;
  description?: string;
}
