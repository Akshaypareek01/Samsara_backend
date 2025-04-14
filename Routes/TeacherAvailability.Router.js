import express from 'express';
import {
    createAvailability,
    getTeacherAvailabilities,
    updateAvailability,
    deleteAvailability,
    getAvailableSlots
} from '../Controllers/TeacherAvailability.Controller.js';

const router = express.Router();

// Create new availability
router.post('/', createAvailability);

// Get all availabilities for a teacher
router.get('/teacher/:teacherId', getTeacherAvailabilities);

// Get available slots for a specific date
router.get('/available-slots/:teacherId/:date', getAvailableSlots);

// Update availability
router.patch('/:id', updateAvailability);

// Delete availability
router.delete('/:id', deleteAvailability);

export default router; 