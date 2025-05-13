import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Note cannot exceed 200 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Compound index for faster queries and to ensure uniqueness
habitLogSchema.index({ habit: 1, date: 1, user: 1 }, { unique: true });

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

export default HabitLog;