"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardOverview = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const getDashboardOverview = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        // Get projects for this user
        const userProjects = await prisma.project.findMany({
            where: {
                OR: [
                    { adminId: req.user.id },
                    { teamMembers: { some: { userId: req.user.id } } }
                ]
            },
            select: { id: true }
        });
        const projectIds = userProjects.map(p => p.id);
        // Get all tasks in user's projects
        const allTasks = await prisma.task.findMany({
            where: { projectId: { in: projectIds } }
        });
        // Get tasks assigned to user
        const assignedTasks = await prisma.task.findMany({
            where: {
                assignees: {
                    some: { userId: req.user.id }
                },
                projectId: { in: projectIds }
            },
            include: {
                project: { select: { name: true } }
            }
        });
        // Calculate stats
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.status === 'DONE').length;
        const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
        const todoTasks = allTasks.filter(t => t.status === 'TODO').length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE').length;
        // Get recent tasks
        const recentTasks = await prisma.task.findMany({
            where: { projectId: { in: projectIds } },
            include: {
                project: { select: { name: true } },
                assignees: {
                    include: {
                        user: { select: { name: true } }
                    }
                },
                creator: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        const overview = {
            stats: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                todoTasks,
                overdueTasks,
                assignedToYou: assignedTasks.length
            },
            assignedTasks: assignedTasks.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                projectName: t.project.name,
                dueDate: t.dueDate
            })),
            recentTasks: recentTasks.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                projectName: t.project.name,
                assignees: t.assignees.map((assignee) => assignee.user.name),
                creator: t.creator.name,
                createdAt: t.createdAt
            }))
        };
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Dashboard overview retrieved', overview));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get dashboard overview', undefined, error.message));
        }
    }
};
exports.getDashboardOverview = getDashboardOverview;
//# sourceMappingURL=dashboardController.js.map