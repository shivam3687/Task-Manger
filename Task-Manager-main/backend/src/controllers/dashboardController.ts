import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { sendResponse } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
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

    const overdueTasks = allTasks.filter(
      t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'DONE'
    ).length;

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

    res.status(200).json(sendResponse(true, 'Dashboard overview retrieved', overview));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to get dashboard overview', undefined, error.message));
    }
  }
};
