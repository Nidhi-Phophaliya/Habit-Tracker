import express from 'express';
import { body } from 'express-validator';
import * as habitController from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation middleware
const habitValidation = [
  body('name').notEmpty().withMessage('Habit name is required'),
  body('frequency').isArray().withMessage('Frequency must be an array'),
];

// All routes are protected
router.use(protect);

// Habit routes
router.post('/', habitValidation, habitController.createHabit);
router.get('/', habitController.getHabits);
router.get('/archived', habitController.getArchivedHabits);
router.get('/:id', habitController.getHabitById);
router.put('/:id', habitValidation, habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.patch('/:id/archive', habitController.archiveHabit);
router.patch('/:id/unarchive', habitController.unarchiveHabit);

// Habit log routes
router.post('/:id/log', [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('completed').isBoolean().withMessage('Completed must be a boolean value'),
], habitController.logHabit);
router.get('/:id/logs', habitController.getHabitLogs);
router.delete('/:id/logs/:logId', habitController.deleteHabitLog);

export default router;