import { Mood } from "../Models/UserMood.Model.js";


// Get mood by user ID
export const getMoodByUserId = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.params.userId });
    res.status(200).json(moods);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create a new mood
export const createMood = async (req, res) => {
  const { userId, mood } = req.body;

  try {
    const newMood = new Mood({ userId, mood });
    await newMood.save();
    res.status(201).json(newMood);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update mood by user ID
export const updateMoodByUserId = async (req, res) => {
  const { userId, mood } = req.body;

  try {
    const updatedMood = await Mood.findOneAndUpdate(
      { userId },
      { mood, createdAt: Date.now() },
      { new: true }
    );
    res.status(200).json(updatedMood);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete mood by user ID
export const deleteMoodByUserId = async (req, res) => {
  try {
    await Mood.deleteOne({ userId: req.params.userId });
    res.status(200).json({ message: 'Mood deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
