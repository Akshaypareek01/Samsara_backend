import { WaterIntake } from '../Models/WaterIntake.Model.js';
import { User } from '../Models/User.Model.js';

// Initialize water intake tracking for a user
export const initializeWaterIntake = async (req, res) => {
    try {
        const { userId, dailyGoal } = req.body;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        // Check if water intake tracking already exists
        const existingTracking = await WaterIntake.findOne({ userId });
        if (existingTracking) {
            return res.status(400).json({
                status: 'fail',
                message: 'Water intake tracking already initialized for this user'
            });
        }

        // Create new water intake tracking
        const waterIntake = await WaterIntake.create({
            userId,
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
export const updateDailyGoal = async (req, res) => {
    try {
        const { userId } = req.params;
        const { dailyGoal } = req.body;

        if (!dailyGoal || dailyGoal <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Valid daily goal is required'
            });
        }

        const waterIntake = await WaterIntake.findOne({ userId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this user'
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
export const addWaterIntake = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Valid water intake amount is required'
            });
        }

        const waterIntake = await WaterIntake.findOne({ userId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this user'
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
export const getTodaySummary = async (req, res) => {
    try {
        const { userId } = req.params;

        const waterIntake = await WaterIntake.findOne({ userId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this user'
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
export const getDateHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                status: 'fail',
                message: 'Date is required'
            });
        }

        const waterIntake = await WaterIntake.findOne({ userId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this user'
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
export const getDateRangeHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                status: 'fail',
                message: 'Start date and end date are required'
            });
        }

        const waterIntake = await WaterIntake.findOne({ userId });
        if (!waterIntake) {
            return res.status(404).json({
                status: 'fail',
                message: 'Water intake tracking not found for this user'
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