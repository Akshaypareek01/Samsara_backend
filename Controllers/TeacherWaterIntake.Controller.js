import { TeacherWaterIntake } from '../Models/TeacherWaterIntake.Model.js';
import { Teacher } from '../Models/Teachers.Model.js';

// Initialize water intake tracking for a teacher
export const initializeTeacherWaterIntake = async (req, res) => {
    try {
        const { teacherId, dailyGoal } = req.body;

        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({
                status: 'fail',
                message: 'Teacher not found'
            });
        }

        // Check if water intake tracking already exists
        const existingTracking = await TeacherWaterIntake.findOne({ teacherId });
        if (existingTracking) {
            return res.status(400).json({
                status: 'fail',
                message: 'Water intake tracking already initialized for this teacher'
            });
        }

        // Create new water intake tracking
        const waterIntake = await TeacherWaterIntake.create({
            teacherId,
            dailyGoal: dailyGoal || 2000 // Default to 2000ml if not specified
        });

        res.status(201).json({
            status: 'success',
            data: {
                waterIntake
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update daily water intake goal
export const updateTeacherDailyGoal = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { dailyGoal } = req.body;

        if (!dailyGoal || dailyGoal <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Valid daily goal is required'
            });
        }

        const waterIntake = await TeacherWaterIntake.findOne({ teacherId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this teacher'
            });
        }

        waterIntake.dailyGoal = dailyGoal;
        await waterIntake.save();

        res.status(200).json({
            status: 'success',
            data: {
                waterIntake
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Add water intake entry
export const addTeacherWaterIntake = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { amount, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Valid water intake amount is required'
            });
        }

        const waterIntake = await TeacherWaterIntake.findOne({ teacherId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this teacher'
            });
        }

        const updatedWaterIntake = await waterIntake.addIntake(amount, note);

        res.status(200).json({
            status: 'success',
            data: {
                waterIntake: updatedWaterIntake,
                todaySummary: updatedWaterIntake.getTodaySummary()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get today's water intake summary
export const getTeacherTodaySummary = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const waterIntake = await TeacherWaterIntake.findOne({ teacherId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this teacher'
            });
        }

        const todaySummary = waterIntake.getTodaySummary();

        res.status(200).json({
            status: 'success',
            data: {
                todaySummary,
                dailyGoal: waterIntake.dailyGoal
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get water intake history for a specific date
export const getTeacherDateHistory = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                status: 'fail',
                message: 'Date is required'
            });
        }

        const waterIntake = await TeacherWaterIntake.findOne({ teacherId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this teacher'
            });
        }

        const history = waterIntake.getDateHistory(date);
        const dailySummary = waterIntake.dailySummary.find(summary => {
            const summaryDate = new Date(summary.date);
            const targetDate = new Date(date);
            return summaryDate.getTime() === targetDate.getTime();
        });

        res.status(200).json({
            status: 'success',
            data: {
                history,
                dailySummary: dailySummary || { totalIntake: 0, goalAchieved: false }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get water intake history for a date range
export const getTeacherDateRangeHistory = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 'fail',
                message: 'Start date and end date are required'
            });
        }

        const waterIntake = await TeacherWaterIntake.findOne({ teacherId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this teacher'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const filteredHistory = waterIntake.intakeHistory.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= start && entryDate <= end;
        });

        const filteredSummary = waterIntake.dailySummary.filter(summary => {
            const summaryDate = new Date(summary.date);
            return summaryDate >= start && summaryDate <= end;
        });

        res.status(200).json({
            status: 'success',
            data: {
                history: filteredHistory,
                dailySummaries: filteredSummary
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}; 