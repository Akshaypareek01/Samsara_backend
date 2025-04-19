import express from 'express';
import {
    initializeTeacherWaterIntake,
    updateTeacherDailyGoal,
    addTeacherWaterIntake,
    getTeacherTodaySummary,
    getTeacherDateHistory,
    getTeacherDateRangeHistory
} from '../Controllers/TeacherWaterIntake.Controller.js';

const teacherWaterIntakeRouter = express.Router();

// Initialize water intake tracking for a teacher
teacherWaterIntakeRouter.post('/initialize', initializeTeacherWaterIntake);

// Update daily water intake goal
teacherWaterIntakeRouter.patch('/:teacherId/goal', updateTeacherDailyGoal);

// Add water intake entry
teacherWaterIntakeRouter.post('/:teacherId/intake', addTeacherWaterIntake);

// Get today's water intake summary
teacherWaterIntakeRouter.get('/:teacherId/today', getTeacherTodaySummary);

// Get water intake history for a specific date
teacherWaterIntakeRouter.get('/:teacherId/history', getTeacherDateHistory);

// Get water intake history for a date range
teacherWaterIntakeRouter.get('/:teacherId/range', getTeacherDateRangeHistory);

export default teacherWaterIntakeRouter; 