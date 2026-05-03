"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableUsers = exports.removeTeamMember = exports.addTeamMember = exports.getTeamMembers = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const getTeamMembers = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const projectId = req.params.projectId;
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errorHandler_1.AppError(404, 'Project not found');
        }
        const userId = req.user.id;
        const hasAccess = project.adminId === userId ||
            !!(await prisma.teamMember.findFirst({
                where: { projectId, userId }
            }));
        if (!hasAccess) {
            throw new errorHandler_1.AppError(403, 'You do not have access to this project');
        }
        const members = await prisma.teamMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Team members retrieved', members));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get team members', undefined, error.message));
        }
    }
};
exports.getTeamMembers = getTeamMembers;
const addTeamMember = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const projectId = req.params.projectId;
        const { userId, role = 'MEMBER' } = req.body;
        if (!userId) {
            throw new errorHandler_1.AppError(400, 'User ID is required');
        }
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errorHandler_1.AppError(404, 'Project not found');
        }
        if (project.adminId !== req.user.id) {
            throw new errorHandler_1.AppError(403, 'Only project admin can add team members');
        }
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!userExists) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        const existingMember = await prisma.teamMember.findFirst({
            where: { projectId, userId }
        });
        if (existingMember) {
            throw new errorHandler_1.AppError(400, 'User is already a team member');
        }
        const teamMember = await prisma.teamMember.create({
            data: {
                projectId,
                userId,
                role
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });
        res.status(201).json((0, helpers_1.sendResponse)(true, 'Team member added successfully', teamMember));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to add team member', undefined, error.message));
        }
    }
};
exports.addTeamMember = addTeamMember;
const removeTeamMember = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const projectId = req.params.projectId;
        const userId = req.params.userId;
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errorHandler_1.AppError(404, 'Project not found');
        }
        if (project.adminId !== req.user.id) {
            throw new errorHandler_1.AppError(403, 'Only project admin can remove team members');
        }
        const member = await prisma.teamMember.findFirst({
            where: { projectId, userId }
        });
        if (!member) {
            throw new errorHandler_1.AppError(404, 'Team member not found');
        }
        await prisma.taskAssignment.deleteMany({
            where: {
                userId,
                task: {
                    projectId
                }
            }
        });
        await prisma.teamMember.delete({
            where: { id: member.id }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Team member removed successfully'));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to remove team member', undefined, error.message));
        }
    }
};
exports.removeTeamMember = removeTeamMember;
const getAvailableUsers = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const projectId = req.params.projectId;
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new errorHandler_1.AppError(404, 'Project not found');
        }
        if (project.adminId !== req.user.id) {
            throw new errorHandler_1.AppError(403, 'Only project admin can view available users');
        }
        const existingMemberIds = await prisma.teamMember.findMany({
            where: { projectId },
            select: { userId: true }
        });
        const existingIds = [project.adminId, ...existingMemberIds.map((member) => member.userId)];
        const users = await prisma.user.findMany({
            where: {
                id: { notIn: existingIds }
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Available users retrieved', users));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get available users', undefined, error.message));
        }
    }
};
exports.getAvailableUsers = getAvailableUsers;
//# sourceMappingURL=teamController.js.map