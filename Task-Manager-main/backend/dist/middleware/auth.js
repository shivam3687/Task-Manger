"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const helpers_1 = require("../utils/helpers");
const authMiddleware = (req, res, next) => {
    const token = (0, helpers_1.extractToken)(req.headers.authorization || '');
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided',
            error: 'Unauthorized'
        });
    }
    const payload = (0, helpers_1.verifyToken)(token);
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
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
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
exports.adminMiddleware = adminMiddleware;
const optionalAuthMiddleware = (req, res, next) => {
    const token = (0, helpers_1.extractToken)(req.headers.authorization || '');
    if (token) {
        const payload = (0, helpers_1.verifyToken)(token);
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
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=auth.js.map