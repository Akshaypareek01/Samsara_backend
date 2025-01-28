import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  password: { type: String, required: true },
  meeting_number:{ type: String},
  teacher: { type: mongoose.Schema.Types.ObjectId,
    ref: 'Teachers',
    required: true, },
    status: {
      type: Boolean,
      default: false,
    },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  schedule: { type: Date, default: Date.now, required: true },
  startTime:{ type: String, required: false },
  endTime:{ type: String, required: false },
  recordingPath: String,
  // Add other fields as needed
});

export const Class = mongoose.model('Class', classSchema);

