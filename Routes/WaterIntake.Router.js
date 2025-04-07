import express from 'express';
import {
    initializeWaterIntake,
    updateDailyGoal,
    addWaterIntake,
    getTodaySummary,
    getDateHistory,
    getDateRangeHistory
} from '../Controllers/WaterIntake.Controller.js';

const waterIntakeRouter = express.Router();

// Initialize water intake tracking for a user
waterIntakeRouter.post('/initialize', initializeWaterIntake);

// Update daily water intake goal
waterIntakeRouter.patch('/:userId/goal', updateDailyGoal);

// Add water intake entry
waterIntakeRouter.post('/:userId/intake', addWaterIntake);

// Get today's water intake summary
waterIntakeRouter.get('/:userId/today', getTodaySummary);

// Get water intake history for a specific date
waterIntakeRouter.get('/:userId/history', getDateHistory);

// Get water intake history for a date range
waterIntakeRouter.get('/:userId/range', getDateRangeHistory);

export default waterIntakeRouter; 