import { StepTracker } from '../Models/StepTracker.Model.js';
import { User } from '../Models/User.Model.js';

// Initialize step tracking for a user
export const initializeStepTracker = async (req, res) => {
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

        // Check if step tracking already exists
        const existingTracker = await StepTracker.findOne({ userId });
        if (existingTracker) {
            return res.status(400).json({
                status: 'fail',
                message: 'Step tracking already initialized for this user'
            });
        }

        // Create new step tracking
        const stepTracker = await StepTracker.create({
            userId,
            dailyGoal: dailyGoal || 10000 // Default to 10,000 steps if not specified
        });

        res.status(201).json({
            status: 'success',
            data: {
                stepTracker
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update daily step goal
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

        const stepTracker = await StepTracker.findOne({ userId });
        if (!stepTracker) {
            return res.status(404).json({
                status: 'fail',
                message: 'Step tracking not found for this user'
            });
        }

        stepTracker.dailyGoal = dailyGoal;
        await stepTracker.save();

        res.status(200).json({
            status: 'success',
            data: {
                stepTracker
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Add steps entry
export const addSteps = async (req, res) => {
    try {
        const { userId } = req.params;
        const { steps, distance, calories, note } = req.body;

        if (!steps || steps <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Valid step count is required'
            });
        }

        const stepTracker = await StepTracker.findOne({ userId });
        if (!stepTracker) {
            return res.status(404).json({
                status: 'fail',
                message: 'Step tracking not found for this user'
            });
        }

        const updatedStepTracker = await stepTracker.addSteps(
            steps,
            distance || 0,
            calories || 0,
            note || ''
        );

        res.status(200).json({
            status: 'success',
            data: {
                stepTracker: updatedStepTracker,
                todaySummary: updatedStepTracker.getTodaySummary()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get today's step summary
export const getTodaySummary = async (req, res) => {
    try {
        const { userId } = req.params;

        const stepTracker = await StepTracker.findOne({ userId });
        if (!stepTracker) {
            return res.status(404).json({
                status: 'fail',
                message: 'Step tracking not found for this user'
            });
        }

        const todaySummary = stepTracker.getTodaySummary();

        res.status(200).json({
            status: 'success',
            data: {
                todaySummary,
                dailyGoal: stepTracker.dailyGoal
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get step history for a specific date
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

        const stepTracker = await StepTracker.findOne({ userId });
        if (!stepTracker) {
            return res.status(404).json({
                status: 'fail',
                message: 'Step tracking not found for this user'
            });
        }

        const history = stepTracker.getDateHistory(date);
        const dailySummary = stepTracker.dailySummary.find(summary => {
            const summaryDate = new Date(summary.date);
            const targetDate = new Date(date);
            return summaryDate.getTime() === targetDate.getTime();
        });

        res.status(200).json({
            status: 'success',
            data: {
                history,
                dailySummary: dailySummary || { 
                    totalSteps: 0, 
                    totalDistance: 0, 
                    totalCalories: 0, 
                    goalAchieved: false 
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get step history for a date range
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

        const stepTracker = await StepTracker.findOne({ userId });
        if (!stepTracker) {
            return res.status(404).json({
                status: 'fail',
                message: 'Step tracking not found for this user'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const filteredHistory = stepTracker.stepHistory.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= start && entryDate <= end;
        });

        const filteredSummary = stepTracker.dailySummary.filter(summary => {
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