import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/overview', authMiddleware, asyncHandler(getDashboardOverview));

export default router;
