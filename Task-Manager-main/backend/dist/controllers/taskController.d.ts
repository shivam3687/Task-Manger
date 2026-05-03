import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getProjectTasks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createTask: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTaskById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTask: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTaskStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteTask: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addTaskComment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=taskController.d.ts.map