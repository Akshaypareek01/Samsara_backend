import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  score: { type: Number, min: 0, max: 100 }, // Or use a different scale
  // Add other fields as needed
});

export const Assessment = mongoose.model('Assessment', assessmentSchema);

