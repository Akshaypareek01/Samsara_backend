import { Mood } from "../Models/UserMood.Model.js";


// 1️⃣ Add Mood Entry
export const addMood = async (req, res) => {
    const { userId, mood, note } = req.body;

    try {
        const newMood = new Mood({ userId, mood, note });
        await newMood.save();

        res.status(201).json({ message: 'Mood added successfully', mood: newMood });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// 2️⃣ Get Mood History (Date-wise)
export const getMoodHistory = async (req, res) => {
    const { userId, startDate, endDate } = req.body;

    try {
        const query = { userId };
        if (startDate && endDate) {
            query.createdAt = { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate)
            };
        }

        const moodHistory = await Mood.find(query).sort({ createdAt: -1 });

        res.status(200).json({ total: moodHistory.length, history: moodHistory });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// 3️⃣ Get Latest Mood Entry
export const getLatestMood = async (req, res) => {
    const { userId } = req.body;

    try {
        const latestMood = await Mood.findOne({ userId }).sort({ createdAt: -1 });

        if (!latestMood) {
            return res.status(404).json({ message: 'No mood history found' });
        }

        res.status(200).json(latestMood);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// 4️⃣ Delete a Mood Entry
export const deleteMoodEntry = async (req, res) => {
    const { moodId } = req.params;

    try {
        const deletedMood = await Mood.findByIdAndDelete(moodId);
        if (!deletedMood) {
            return res.status(404).json({ message: 'Mood entry not found' });
        }

        res.status(200).json({ message: 'Mood entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};




