import mongoose from 'mongoose';

const stepTrackerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'User ID is required']
    },
    dailyGoal: {
        type: Number,
        default: 10000, // Default goal of 10,000 steps
        required: [true, 'Daily step goal is required']
    },
    stepHistory: [{
        steps: {
            type: Number,
            required: [true, 'Step count is required']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        distance: {
            type: Number, // Distance in kilometers
            default: 0
        },
        calories: {
            type: Number, // Calories burned
            default: 0
        },
        note: {
            type: String,
            default: ''
        }
    }],
    dailySummary: [{
        date: {
            type: Date,
            required: true
        },
        totalSteps: {
            type: Number,
            default: 0
        },
        totalDistance: {
            type: Number,
            default: 0
        },
        totalCalories: {
            type: Number,
            default: 0
        },
        goalAchieved: {
            type: Boolean,
            default: false
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
stepTrackerSchema.index({ userId: 1, 'dailySummary.date': 1 });

// Method to add steps
stepTrackerSchema.methods.addSteps = async function(steps, distance = 0, calories = 0, note = '') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add to step history
    this.stepHistory.push({
        steps,
        timestamp: new Date(),
        distance,
        calories,
        note
    });

    // Update daily summary
    const todaySummary = this.dailySummary.find(summary => 
        summary.date.getTime() === today.getTime()
    );

    if (todaySummary) {
        todaySummary.totalSteps += steps;
        todaySummary.totalDistance += distance;
        todaySummary.totalCalories += calories;
        todaySummary.goalAchieved = todaySummary.totalSteps >= this.dailyGoal;
    } else {
        this.dailySummary.push({
            date: today,
            totalSteps: steps,
            totalDistance: distance,
            totalCalories: calories,
            goalAchieved: steps >= this.dailyGoal
        });
    }

    this.lastUpdated = new Date();
    await this.save();
    return this;
};

// Method to get today's summary
stepTrackerSchema.methods.getTodaySummary = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.dailySummary.find(summary => 
        summary.date.getTime() === today.getTime()
    ) || { 
        date: today, 
        totalSteps: 0, 
        totalDistance: 0, 
        totalCalories: 0, 
        goalAchieved: false 
    };
};

// Method to get step history for a specific date
stepTrackerSchema.methods.getDateHistory = function(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return this.stepHistory.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === targetDate.getTime();
    });
};

export const StepTracker = mongoose.model('StepTracker', stepTrackerSchema); 