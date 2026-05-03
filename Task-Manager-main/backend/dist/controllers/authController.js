"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.signup = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Validation
        if (!email || !password || !name) {
            throw new errorHandler_1.AppError(400, 'Email, password, and name are required');
        }
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new errorHandler_1.AppError(400, 'User already exists with this email');
        }
        // Hash password
        const passwordHash = await (0, helpers_1.hashPassword)(password);
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
        const token = (0, helpers_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role
        });
        res.status(201).json((0, helpers_1.sendResponse)(true, 'User created successfully', {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        }));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Signup failed', undefined, error.message));
        }
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            throw new errorHandler_1.AppError(400, 'Email and password are required');
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new errorHandler_1.AppError(401, 'Invalid email or password');
        }
        // Compare password
        const isPasswordValid = await (0, helpers_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError(401, 'Invalid email or password');
        }
        // Generate token
        const token = (0, helpers_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Login successful', {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        }));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Login failed', undefined, error.message));
        }
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
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
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Profile retrieved', user));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get profile', undefined, error.message));
        }
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map