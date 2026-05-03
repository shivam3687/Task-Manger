"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.createProject = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const getProjects = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { adminId: req.user.id },
                    { teamMembers: { some: { userId: req.user.id } } }
                ]
            },
            include: {
                admin: {
                    select: { id: true, name: true, email: true }
                },
                teamMembers: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Projects retrieved', projects));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get projects', undefined, error.message));
        }
    }
};
exports.getProjects = getProjects;
const createProject = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        if (req.user.role !== 'ADMIN') {
            throw new errorHandler_1.AppError(403, 'Only admins can create projects');
        }
        const { name, description } = req.body;
        if (!name) {
            throw new errorHandler_1.AppError(400, 'Project name is required');
        }
        const project = await prisma.project.create({
            data: {
                name,
                description,
                adminId: req.user.id
            },
            include: {
                admin: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        res.status(201).json((0, helpers_1.sendResponse)(true, 'Project created successfully', project));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to create project', undefined, error.message));
        }
    }
};
exports.createProject = createProject;
const getProjectById = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const id = req.params.id; // ✅ Fix: cast to string
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                admin: {
                    select: { id: true, name: true, email: true }
                },
                teamMembers: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                },
                tasks: {
                    include: {
                        assignees: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true }
                                }
                            }
                        },
                        creator: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        });
        if (!project) {
            throw new errorHandler_1.AppError(404, 'Project not found');
        }
        const userId = req.user.id; // ✅ Fix: extract before callback to avoid 'possibly undefined'
        const hasAccess = project.adminId === userId ||
            project.teamMembers.some((tm) => tm.userId === userId);
        if (!hasAccess) {
            throw new errorHandler_1.AppError(403, 'You do not have access to this project');
        }
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Project retrieved', project));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get project', undefined, error.message));
        }
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const id = req.params.id; // ✅ Fix: cast to string
        const { name, description } = req.body;
        const project = await prisma.project.findUnique({
            where: { id }
        });
        if (!project) {
            throw new errorHandler_1.AppError(404, 'Project not found');
        }
        if (project.adminId !== req.user.id) {
            throw new errorHandler_1.AppError(403, 'Only project admin can update project');
        }
        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description && { description })
            },
            include: {
                admin: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Project updated successfully', updatedProject));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to update project', undefined, error.message));
        }
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const id = req.params.id; // ✅ Fix: cast to string
        const project = await prisma.project.findUnique({
            where: { id }
        });
        if (!project) {
            throw new errorHandler_1.AppError(404, 'Project not found');
        }
        if (project.adminId !== req.user.id) {
            throw new errorHandler_1.AppError(403, 'Only project admin can delete project');
        }
        await prisma.project.delete({
            where: { id }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Project deleted successfully'));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to delete project', undefined, error.message));
        }
    }
};
exports.deleteProject = deleteProject;
//# sourceMappingURL=projectController.js.map