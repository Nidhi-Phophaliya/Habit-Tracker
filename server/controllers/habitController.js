import { validationResult } from 'express-validator';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, icon, color, frequency, reminderTime } = req.body;

    const habit = await Habit.create({
      user: req.user._id,
      name,
      description,
      icon: icon || 'check-circle',
      color: color || 'teal',
      frequency,
      reminderTime,
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({
      error: {
        message: 'Server error creating habit',
        status: 500,
      },
    });
  }
};

// @desc    Get all active habits
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      user: req.user._id,
      isArchived: false 
    }).sort({ createdAt: -1 });

    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get logs for today
    const todayLogs = await HabitLog.find({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Map logs to habit IDs
    const completedHabits = todayLogs.reduce((acc, log) => {
      if (log.completed) {
        acc[log.habit.toString()] = true;
      }
      return acc;
    }, {});

    // Add completion status to habits
    const habitsWithStatus = habits.map(habit => {
      const habitObj = habit.toObject();
      habitObj.completedToday = !!completedHabits[habit._id.toString()];
      return habitObj;
    });

    res.status(200).json(habitsWithStatus);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving habits',
        status: 500,
      },
    });
  }
};

// @desc    Get archived habits
// @route   GET /api/habits/archived
// @access  Private
export const getArchivedHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ 
      user: req.user._id,
      isArchived: true 
    }).sort({ updatedAt: -1 });

    res.status(200).json(habits);
  } catch (error) {
    console.error('Get archived habits error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving archived habits',
        status: 500,
      },
    });
  }
};

// @desc    Get habit by ID
// @route   GET /api/habits/:id
// @access  Private
export const getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    res.status(200).json(habit);
  } catch (error) {
    console.error('Get habit error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving habit',
        status: 500,
      },
    });
  }
};

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, icon, color, frequency, reminderTime } = req.body;

    // Find habit
    let habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    // Update fields
    habit.name = name || habit.name;
    habit.description = description !== undefined ? description : habit.description;
    habit.icon = icon || habit.icon;
    habit.color = color || habit.color;
    habit.frequency = frequency || habit.frequency;
    habit.reminderTime = reminderTime !== undefined ? reminderTime : habit.reminderTime;

    await habit.save();

    res.status(200).json(habit);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({
      error: {
        message: 'Server error updating habit',
        status: 500,
      },
    });
  }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res) => {
  try {
    // Find and remove habit
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    // Remove all associated logs
    await HabitLog.deleteMany({
      habit: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({
      error: {
        message: 'Server error deleting habit',
        status: 500,
      },
    });
  }
};

// @desc    Archive habit
// @route   PATCH /api/habits/:id/archive
// @access  Private
export const archiveHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    habit.isArchived = true;
    await habit.save();

    res.status(200).json({ message: 'Habit archived successfully' });
  } catch (error) {
    console.error('Archive habit error:', error);
    res.status(500).json({
      error: {
        message: 'Server error archiving habit',
        status: 500,
      },
    });
  }
};

// @desc    Unarchive habit
// @route   PATCH /api/habits/:id/unarchive
// @access  Private
export const unarchiveHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    habit.isArchived = false;
    await habit.save();

    res.status(200).json({ message: 'Habit unarchived successfully' });
  } catch (error) {
    console.error('Unarchive habit error:', error);
    res.status(500).json({
      error: {
        message: 'Server error unarchiving habit',
        status: 500,
      },
    });
  }
};

// @desc    Log a habit completion
// @route   POST /api/habits/:id/log
// @access  Private
export const logHabit = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, completed, note } = req.body;
    const habitId = req.params.id;

    // Check if habit exists and belongs to user
    const habit = await Habit.findOne({
      _id: habitId,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    // Format date to remove time component
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Check if log already exists
    let habitLog = await HabitLog.findOne({
      habit: habitId,
      user: req.user._id,
      date: logDate,
    });

    if (habitLog) {
      // Update existing log
      habitLog.completed = completed;
      if (note !== undefined) {
        habitLog.note = note;
      }
      await habitLog.save();
    } else {
      // Create new log
      habitLog = await HabitLog.create({
        habit: habitId,
        user: req.user._id,
        date: logDate,
        completed,
        note,
      });
    }

    res.status(200).json(habitLog);
  } catch (error) {
    console.error('Log habit error:', error);
    res.status(500).json({
      error: {
        message: 'Server error logging habit',
        status: 500,
      },
    });
  }
};

// @desc    Get habit logs
// @route   GET /api/habits/:id/logs
// @access  Private
export const getHabitLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);

    // Check if habit exists and belongs to user
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    // Get logs for specified date range
    const logs = await HabitLog.find({
      habit: req.params.id,
      user: req.user._id,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: -1 });

    res.status(200).json(logs);
  } catch (error) {
    console.error('Get habit logs error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving habit logs',
        status: 500,
      },
    });
  }
};

// @desc    Delete habit log
// @route   DELETE /api/habits/:id/logs/:logId
// @access  Private
export const deleteHabitLog = async (req, res) => {
  try {
    // Check if habit exists and belongs to user
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        error: {
          message: 'Habit not found',
          status: 404,
        },
      });
    }

    // Find and remove log
    const log = await HabitLog.findOneAndDelete({
      _id: req.params.logId,
      habit: req.params.id,
      user: req.user._id,
    });

    if (!log) {
      return res.status(404).json({
        error: {
          message: 'Log not found',
          status: 404,
        },
      });
    }

    res.status(200).json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete habit log error:', error);
    res.status(500).json({
      error: {
        message: 'Server error deleting habit log',
        status: 500,
      },
    });
  }
};