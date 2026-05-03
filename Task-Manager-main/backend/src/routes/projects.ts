import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getTeamMembers, addTeamMember, removeTeamMember, getAvailableUsers } from '../controllers/teamController';
import { getProjectTasks, createTask } from '../controllers/taskController';

const router = Router();

// Project routes
router.get('/', authMiddleware, asyncHandler(getProjects));
router.post('/', authMiddleware, adminMiddleware, asyncHandler(createProject));
router.get('/:id', authMiddleware, asyncHandler(getProjectById));
router.put('/:id', authMiddleware, adminMiddleware, asyncHandler(updateProject));
router.delete('/:id', authMiddleware, adminMiddleware, asyncHandler(deleteProject));

// Team member routes
router.get('/:projectId/members', authMiddleware, asyncHandler(getTeamMembers));
router.post('/:projectId/members', authMiddleware, adminMiddleware, asyncHandler(addTeamMember));
router.delete('/:projectId/members/:userId', authMiddleware, adminMiddleware, asyncHandler(removeTeamMember));
router.get('/:projectId/available-users', authMiddleware, asyncHandler(getAvailableUsers));

// Task routes
router.get('/:projectId/tasks', authMiddleware, asyncHandler(getProjectTasks));
router.post('/:projectId/tasks', authMiddleware, asyncHandler(createTask));

export default router;
