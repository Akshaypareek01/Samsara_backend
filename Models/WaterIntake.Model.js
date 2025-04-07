import mongoose from 'mongoose';

const waterIntakeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'User ID is required']
    },
    dailyGoal: {
        type: Number,
        default: 2000, // Default goal in ml
        required: [true, 'Daily water intake goal is required']
    },
    intakeHistory: [{
        amount: {
            type: Number,
            required: [true, 'Water intake amount is required']
        },
        timestamp: {
            type: Date,
            default: Date.now
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
        totalIntake: {
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
waterIntakeSchema.index({ userId: 1, 'dailySummary.date': 1 });

// Method to add water intake
waterIntakeSchema.methods.addIntake = async function(amount, note = '') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add to intake history
    this.intakeHistory.push({
        amount,
        timestamp: new Date(),
        note
    });

    // Update daily summary
    const todaySummary = this.dailySummary.find(summary => 
        summary.date.getTime() === today.getTime()
    );

    if (todaySummary) {
        todaySummary.totalIntake += amount;
        todaySummary.goalAchieved = todaySummary.totalIntake >= this.dailyGoal;
    } else {
        this.dailySummary.push({
            date: today,
            totalIntake: amount,
            goalAchieved: amount >= this.dailyGoal
        });
    }

    this.lastUpdated = new Date();
    await this.save();
    return this;
};

// Method to get today's summary
waterIntakeSchema.methods.getTodaySummary = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.dailySummary.find(summary => 
        summary.date.getTime() === today.getTime()
    ) || { date: today, totalIntake: 0, goalAchieved: false };
};

// Method to get intake history for a specific date
waterIntakeSchema.methods.getDateHistory = function(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return this.intakeHistory.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === targetDate.getTime();
    });
};

export const WaterIntake = mongoose.model('WaterIntake', waterIntakeSchema); 