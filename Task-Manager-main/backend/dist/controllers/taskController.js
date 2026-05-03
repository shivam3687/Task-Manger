"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTaskComment = exports.deleteTask = exports.updateTaskStatus = exports.updateTask = exports.getTaskById = exports.createTask = exports.getProjectTasks = void 0;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma = new client_1.PrismaClient();
const taskInclude = {
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
};
const taskDetailsInclude = {
    ...taskInclude,
    project: true,
    history: {
        include: {
            user: { select: { id: true, name: true } }
        }
    }
};
const getTaskAccessState = async (taskId, userId) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: true,
            assignees: {
                select: { userId: true }
            }
        }
    });
    if (!task) {
        throw new errorHandler_1.AppError(404, 'Task not found');
    }
    const isProjectAdmin = task.project.adminId === userId;
    const isCreator = task.createdBy === userId;
    const isAssignee = task.assignees.some((assignment) => assignment.userId === userId);
    const isProjectMember = isProjectAdmin ||
        !!(await prisma.teamMember.findFirst({
            where: { projectId: task.projectId, userId }
        }));
    return {
        task,
        isProjectAdmin,
        isCreator,
        isAssignee,
        isProjectMember
    };
};
const createTaskHistoryEntry = async ({ taskId, changedBy, changeType, oldValue, newValue }) => {
    await prisma.taskHistory.create({
        data: {
            taskId,
            changedBy,
            changeType,
            oldValue,
            newValue
        }
    });
};
const normalizeAssignedUserIds = (assignedUserIds) => {
    if (!assignedUserIds) {
        return [];
    }
    return [...new Set(assignedUserIds.filter(Boolean))];
};
const getProjectWithAccess = async (projectId, userId) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            teamMembers: {
                select: { userId: true }
            }
        }
    });
    if (!project) {
        throw new errorHandler_1.AppError(404, 'Project not found');
    }
    const hasAccess = project.adminId === userId ||
        project.teamMembers.some((member) => member.userId === userId);
    if (!hasAccess) {
        throw new errorHandler_1.AppError(403, 'You do not have access to this project');
    }
    return project;
};
const validateAssignedUsers = async (projectId, adminId, assignedUserIds) => {
    const uniqueAssignedUserIds = normalizeAssignedUserIds(assignedUserIds);
    if (uniqueAssignedUserIds.length === 0) {
        return [];
    }
    const allowedMembers = await prisma.teamMember.findMany({
        where: { projectId },
        select: { userId: true }
    });
    const allowedUserIds = new Set([adminId, ...allowedMembers.map((member) => member.userId)]);
    const invalidUserIds = uniqueAssignedUserIds.filter((id) => !allowedUserIds.has(id));
    if (invalidUserIds.length > 0) {
        throw new errorHandler_1.AppError(400, 'All assigned users must belong to this project');
    }
    const existingUsers = await prisma.user.findMany({
        where: { id: { in: uniqueAssignedUserIds } },
        select: { id: true }
    });
    if (existingUsers.length !== uniqueAssignedUserIds.length) {
        throw new errorHandler_1.AppError(400, 'One or more assigned users do not exist');
    }
    return uniqueAssignedUserIds;
};
const buildAssignmentMutation = (assignedUserIds) => ({
    deleteMany: {},
    ...(assignedUserIds.length > 0
        ? {
            create: assignedUserIds.map((userId) => ({
                user: {
                    connect: { id: userId }
                }
            }))
        }
        : {})
});
const getProjectTasks = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const projectId = req.params.projectId;
        const userId = req.user.id;
        await getProjectWithAccess(projectId, userId);
        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: taskInclude,
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Tasks retrieved', tasks));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get tasks', undefined, error.message));
        }
    }
};
exports.getProjectTasks = getProjectTasks;
const createTask = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const projectId = req.params.projectId;
        const userId = req.user.id;
        const { title, description, assignedUserIds, dueDate } = req.body;
        const status = req.body.status ?? client_1.TaskStatus.TODO;
        const priority = req.body.priority ?? client_1.Priority.MEDIUM;
        if (!title?.trim()) {
            throw new errorHandler_1.AppError(400, 'Task title is required');
        }
        const project = await getProjectWithAccess(projectId, userId);
        if (assignedUserIds !== undefined && project.adminId !== userId) {
            throw new errorHandler_1.AppError(403, 'Only the project admin can assign users to a task');
        }
        const validAssignedUserIds = await validateAssignedUsers(projectId, project.adminId, assignedUserIds);
        const task = await prisma.task.create({
            data: {
                title: title.trim(),
                description,
                status,
                priority,
                projectId,
                createdBy: userId,
                dueDate: dueDate ? new Date(dueDate) : null,
                assignees: validAssignedUserIds.length > 0
                    ? {
                        create: validAssignedUserIds.map((assignedUserId) => ({
                            user: {
                                connect: { id: assignedUserId }
                            }
                        }))
                    }
                    : undefined
            },
            include: taskInclude
        });
        res.status(201).json((0, helpers_1.sendResponse)(true, 'Task created successfully', task));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to create task', undefined, error.message));
        }
    }
};
exports.createTask = createTask;
const getTaskById = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const taskId = req.params.taskId;
        const userId = req.user.id;
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: taskDetailsInclude
        });
        if (!task) {
            throw new errorHandler_1.AppError(404, 'Task not found');
        }
        const hasAccess = task.project.adminId === userId ||
            !!(await prisma.teamMember.findFirst({
                where: { projectId: task.projectId, userId }
            }));
        if (!hasAccess) {
            throw new errorHandler_1.AppError(403, 'You do not have access to this task');
        }
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Task retrieved', task));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to get task', undefined, error.message));
        }
    }
};
exports.getTaskById = getTaskById;
const updateTask = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const taskId = req.params.taskId;
        const userId = req.user.id;
        const { title, description, status, priority, assignedUserIds, dueDate } = req.body;
        const { task, isProjectAdmin, isCreator, isAssignee } = await getTaskAccessState(taskId, userId);
        const canUpdate = isCreator || isAssignee || isProjectAdmin;
        if (!canUpdate) {
            throw new errorHandler_1.AppError(403, 'You do not have permission to update this task');
        }
        if (title !== undefined && !title.trim()) {
            throw new errorHandler_1.AppError(400, 'Task title is required');
        }
        if (assignedUserIds !== undefined && !isProjectAdmin) {
            throw new errorHandler_1.AppError(403, 'Only the project admin can change task assignees');
        }
        const validAssignedUserIds = assignedUserIds !== undefined
            ? await validateAssignedUsers(task.projectId, task.project.adminId, assignedUserIds)
            : undefined;
        const data = {
            ...(title !== undefined && { title: title.trim() }),
            ...(description !== undefined && { description }),
            ...(status && { status: status }),
            ...(priority && { priority: priority }),
            ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null })
        };
        if (validAssignedUserIds !== undefined) {
            data.assignees = buildAssignmentMutation(validAssignedUserIds);
        }
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data,
            include: taskInclude
        });
        if (status && status !== task.status) {
            await createTaskHistoryEntry({
                taskId,
                changedBy: userId,
                changeType: 'STATUS',
                oldValue: task.status,
                newValue: status
            });
        }
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Task updated successfully', updatedTask));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to update task', undefined, error.message));
        }
    }
};
exports.updateTask = updateTask;
const updateTaskStatus = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const taskId = req.params.taskId;
        const userId = req.user.id;
        const { status } = req.body;
        if (!status || !Object.values(client_1.TaskStatus).includes(status)) {
            throw new errorHandler_1.AppError(400, 'Valid status is required');
        }
        const { task, isProjectMember } = await getTaskAccessState(taskId, userId);
        const canUpdate = isProjectMember;
        if (!canUpdate) {
            throw new errorHandler_1.AppError(403, 'You do not have permission to update this task');
        }
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { status: status },
            include: taskInclude
        });
        if (task.status !== status) {
            await createTaskHistoryEntry({
                taskId,
                changedBy: userId,
                changeType: 'STATUS',
                oldValue: task.status,
                newValue: status
            });
        }
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Task status updated successfully', updatedTask));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to update task status', undefined, error.message));
        }
    }
};
exports.updateTaskStatus = updateTaskStatus;
const deleteTask = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const taskId = req.params.taskId;
        const userId = req.user.id;
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) {
            throw new errorHandler_1.AppError(404, 'Task not found');
        }
        const canDelete = task.createdBy === userId || task.project.adminId === userId;
        if (!canDelete) {
            throw new errorHandler_1.AppError(403, 'You do not have permission to delete this task');
        }
        await prisma.task.delete({
            where: { id: taskId }
        });
        res.status(200).json((0, helpers_1.sendResponse)(true, 'Task deleted successfully'));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to delete task', undefined, error.message));
        }
    }
};
exports.deleteTask = deleteTask;
const addTaskComment = async (req, res) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Not authenticated');
        }
        const taskId = req.params.taskId;
        const userId = req.user.id;
        const comment = String(req.body.comment || '').trim();
        if (!comment) {
            throw new errorHandler_1.AppError(400, 'Comment is required');
        }
        const { isProjectMember } = await getTaskAccessState(taskId, userId);
        if (!isProjectMember) {
            throw new errorHandler_1.AppError(403, 'You do not have permission to comment on this task');
        }
        await createTaskHistoryEntry({
            taskId,
            changedBy: userId,
            changeType: 'COMMENT',
            newValue: comment
        });
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: taskDetailsInclude
        });
        res.status(201).json((0, helpers_1.sendResponse)(true, 'Comment added successfully', task));
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json((0, helpers_1.sendResponse)(false, error.message, undefined, error.message));
        }
        else {
            res.status(500).json((0, helpers_1.sendResponse)(false, 'Failed to add comment', undefined, error.message));
        }
    }
};
exports.addTaskComment = addTaskComment;
//# sourceMappingURL=taskController.js.map