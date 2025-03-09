import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: '' // Optional note for the mood
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Mood = mongoose.model('Mood', moodSchema);
