import express from 'express';
import * as statsController from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Stats routes
router.get('/weekly', statsController.getWeeklyStats);
router.get('/monthly', statsController.getMonthlyStats);
router.get('/streaks', statsController.getStreakStats);
router.get('/overview', statsController.getOverviewStats);

export default router;