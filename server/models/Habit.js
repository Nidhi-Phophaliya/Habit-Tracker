import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [50, 'Habit name cannot exceed 50 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  icon: {
    type: String,
    default: 'check-circle',
  },
  color: {
    type: String,
    default: 'teal',
    enum: ['teal', 'purple', 'blue', 'orange', 'red', 'green', 'indigo', 'pink'],
  },
  frequency: {
    type: [String],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    validate: {
      validator: function(days) {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return days.every(day => validDays.includes(day));
      },
      message: 'Invalid frequency day'
    }
  },
  reminderTime: {
    type: String,
    default: '',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Virtual field for current streak
habitSchema.virtual('currentStreak').get(function() {
  return 0; // This will be calculated in the controller
});

// Index for faster queries
habitSchema.index({ user: 1, isArchived: 1 });

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;