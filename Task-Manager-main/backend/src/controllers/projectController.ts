import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, ProjectInput } from '../types';
import { sendResponse } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
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

    res.status(200).json(sendResponse(true, 'Projects retrieved', projects));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to get projects', undefined, error.message));
    }
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    if (req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Only admins can create projects');
    }

    const { name, description }: ProjectInput = req.body;

    if (!name) {
      throw new AppError(400, 'Project name is required');
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

    res.status(201).json(sendResponse(true, 'Project created successfully', project));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to create project', undefined, error.message));
    }
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const id = req.params.id as string; // ✅ Fix: cast to string

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
      throw new AppError(404, 'Project not found');
    }

    const userId = req.user.id; // ✅ Fix: extract before callback to avoid 'possibly undefined'
    const hasAccess = project.adminId === userId ||
      project.teamMembers.some((tm) => tm.userId === userId);

    if (!hasAccess) {
      throw new AppError(403, 'You do not have access to this project');
    }

    res.status(200).json(sendResponse(true, 'Project retrieved', project));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to get project', undefined, error.message));
    }
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const id = req.params.id as string; // ✅ Fix: cast to string
    const { name, description }: ProjectInput = req.body;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.adminId !== req.user.id) {
      throw new AppError(403, 'Only project admin can update project');
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

    res.status(200).json(sendResponse(true, 'Project updated successfully', updatedProject));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to update project', undefined, error.message));
    }
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Not authenticated');
    }

    const id = req.params.id as string; // ✅ Fix: cast to string

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    if (project.adminId !== req.user.id) {
      throw new AppError(403, 'Only project admin can delete project');
    }

    await prisma.project.delete({
      where: { id }
    });

    res.status(200).json(sendResponse(true, 'Project deleted successfully'));
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(sendResponse(false, error.message, undefined, error.message));
    } else {
      res.status(500).json(sendResponse(false, 'Failed to delete project', undefined, error.message));
    }
  }
};
