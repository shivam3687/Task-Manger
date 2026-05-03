import { Router } from 'express';
import {
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addTaskComment
} from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/:taskId', authMiddleware, asyncHandler(getTaskById));
router.put('/:taskId', authMiddleware, asyncHandler(updateTask));
router.patch('/:taskId/status', authMiddleware, asyncHandler(updateTaskStatus));
router.post('/:taskId/comments', authMiddleware, asyncHandler(addTaskComment));
router.delete('/:taskId', authMiddleware, asyncHandler(deleteTask));

export default router;
