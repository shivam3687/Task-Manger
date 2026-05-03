import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { sendResponse } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getTeamMembers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const projectId = req.params.projectId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    const userId = req.user.id;
    const hasAccess = project.adminId === userId ||
      !!(await prisma.teamMember.findFirst({
        where: { projectId, userId }
      }));

    if (!hasAccess) {
      throw new AppError(403, 'You do not have access to this project');
    }

    const members = await prisma.teamMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    res.status(200).json(sendResponse(true, 'Team members retrieved', members));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to get team members', undefined, error.message));
    }
  }
};

export const addTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const projectId = req.params.projectId as string;
    const { userId, role = 'MEMBER' } = req.body;

    if (!userId) {
      throw new AppError(400, 'User ID is required');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.adminId !== req.user.id) {
      throw new AppError(403, 'Only project admin can add team members');
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      throw new AppError(404, 'User not found');
    }

    const existingMember = await prisma.teamMember.findFirst({
      where: { projectId, userId }
    });

    if (existingMember) {
      throw new AppError(400, 'User is already a team member');
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

    res.status(201).json(sendResponse(true, 'Team member added successfully', teamMember));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to add team member', undefined, error.message));
    }
  }
};

export const removeTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const projectId = req.params.projectId as string;
    const userId = req.params.userId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.adminId !== req.user.id) {
      throw new AppError(403, 'Only project admin can remove team members');
    }

    const member = await prisma.teamMember.findFirst({
      where: { projectId, userId }
    });

    if (!member) {
      throw new AppError(404, 'Team member not found');
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

    res.status(200).json(sendResponse(true, 'Team member removed successfully'));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to remove team member', undefined, error.message));
    }
  }
};

export const getAvailableUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const projectId = req.params.projectId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.adminId !== req.user.id) {
      throw new AppError(403, 'Only project admin can view available users');
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

    res.status(200).json(sendResponse(true, 'Available users retrieved', users));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to get available users', undefined, error.message));
    }
  }
};
