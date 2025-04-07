import express from 'express';
import {
    initializeStepTracker,
    updateDailyGoal,
    addSteps,
    getTodaySummary,
    getDateHistory,
    getDateRangeHistory
} from '../Controllers/StepTracker.Controller.js';

const stepTrackerRouter = express.Router();

// Initialize step tracking for a user
stepTrackerRouter.post('/initialize', initializeStepTracker);

// Update daily step goal
stepTrackerRouter.patch('/:userId/goal', updateDailyGoal);

// Add steps entry
stepTrackerRouter.post('/:userId/steps', addSteps);

// Get today's step summary
stepTrackerRouter.get('/:userId/today', getTodaySummary);

// Get step history for a specific date
stepTrackerRouter.get('/:userId/history', getDateHistory);

// Get step history for a date range
stepTrackerRouter.get('/:userId/range', getDateRangeHistory);

export default stepTrackerRouter; 