import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getTeamMembers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addTeamMember: (req: AuthRequest, res: Response) => Promise<void>;
export declare const removeTeamMember: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAvailableUsers: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=teamController.d.ts.map