import { ApiResponse, JwtPayload } from '../types';
export declare const generateToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload | null;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const sendResponse: <T>(success: boolean, message: string, data?: T, error?: string) => ApiResponse<T>;
export declare const extractToken: (authHeader: string) => string | null;
//# sourceMappingURL=helpers.d.ts.map