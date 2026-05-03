import { Router } from 'express';
import { signup, login, getProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(getProfile));

export default router;
