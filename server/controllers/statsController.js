import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';

// Helper function to get date ranges
const getDateRange = (range) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = new Date();
  
  if (range === 'week') {
    // Set to beginning of week (Monday)
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
  } else if (range === 'month') {
    // Set to beginning of month
    start.setDate(1);
  } else if (range === 'year') {
    // Set to beginning of year
    start.setMonth(0, 1);
  }
  
  start.setHours(0, 0, 0, 0);
  
  return { start, end };
};

// Helper function to calculate streaks
const calculateStreaks = (logs, habits) => {
  const streaks = {};
  
  // Group logs by habit
  const habitLogs = {};
  
  habits.forEach(habit => {
    habitLogs[habit._id] = [];
  });
  
  logs.forEach(log => {
    if (habitLogs[log.habit]) {
      habitLogs[log.habit].push(log);
    }
  });
  
  // Calculate streaks for each habit
  Object.keys(habitLogs).forEach(habitId => {
    const sortedLogs = habitLogs[habitId].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;
    
    sortedLogs.forEach(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      
      if (log.completed) {
        if (!lastDate) {
          // First completed log
          currentStreak = 1;
        } else {
          const dayDiff = Math.floor((lastDate - logDate) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            // Consecutive day
            currentStreak += 1;
          } else {
            // Break in streak
            currentStreak = 1;
          }
        }
        
        // Update last date only for completed logs
        lastDate = logDate;
      } else {
        // Reset streak on non-completed logs
        currentStreak = 0;
        lastDate = null;
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
    });
    
    streaks[habitId] = {
      current: currentStreak,
      longest: longestStreak
    };
  });
  
  return streaks;
};

// @desc    Get weekly statistics
// @route   GET /api/stats/weekly
// @access  Private
export const getWeeklyStats = async (req, res) => {
  try {
    const { start, end } = getDateRange('week');
    
    // Get user's active habits
    const habits = await Habit.find({
      user: req.user._id,
      isArchived: false
    });
    
    // Get logs for the week
    const logs = await HabitLog.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });
    
    // Organize data by day of week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyStats = days.map(day => ({ day, completed: 0, total: 0 }));
    
    // Count total habits per day based on frequency
    habits.forEach(habit => {
      const frequency = habit.frequency.map(day => day.toLowerCase());
      days.forEach((day, index) => {
        if (frequency.includes(day.toLowerCase())) {
          dailyStats[index].total += 1;
        }
      });
    });
    
    // Count completed habits
    logs.forEach(log => {
      if (log.completed) {
        const date = new Date(log.date);
        const dayIndex = (date.getDay() || 7) - 1; // Convert to 0-6 (Mon-Sun)
        dailyStats[dayIndex].completed += 1;
      }
    });
    
    // Calculate completion rates
    const dailyData = dailyStats.map(day => ({
      ...day,
      rate: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0
    }));
    
    // Calculate overall stats
    const totalHabits = dailyStats.reduce((sum, day) => sum + day.total, 0);
    const completedHabits = dailyStats.reduce((sum, day) => sum + day.completed, 0);
    const overallRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    
    res.status(200).json({
      dailyData,
      overall: {
        total: totalHabits,
        completed: completedHabits,
        rate: overallRate
      },
      period: {
        start,
        end
      }
    });
  } catch (error) {
    console.error('Weekly stats error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving weekly stats',
        status: 500
      }
    });
  }
};

// @desc    Get monthly statistics
// @route   GET /api/stats/monthly
// @access  Private
export const getMonthlyStats = async (req, res) => {
  try {
    const { start, end } = getDateRange('month');
    
    // Get user's active habits
    const habits = await Habit.find({
      user: req.user._id,
      isArchived: false
    });
    
    // Get logs for the month
    const logs = await HabitLog.find({
      user: req.user._id,
      date: { $gte: start, $lte: end }
    });
    
    // Organize data by week
    const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    const weeks = [];
    
    // Create weeks
    for (let i = 1; i <= daysInMonth; i += 7) {
      const weekStart = new Date(start);
      weekStart.setDate(i);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(Math.min(weekStart.getDate() + 6, daysInMonth));
      
      weeks.push({
        start: new Date(weekStart),
        end: new Date(weekEnd),
        label: `Week ${Math.ceil(i / 7)}`,
        completed: 0,
        total: 0
      });
    }
    
    // Count total possible habit completions
    habits.forEach(habit => {
      const frequency = habit.frequency;
      const frequencyCount = frequency.length;
      
      weeks.forEach(week => {
        // Calculate days in this week
        const daysDiff = Math.floor((week.end - week.start) / (1000 * 60 * 60 * 24)) + 1;
        // Estimate total habits based on frequency
        const weeklyHabits = Math.ceil((daysDiff / 7) * frequencyCount);
        week.total += weeklyHabits;
      });
    });
    
    // Count completed habits by week
    logs.forEach(log => {
      if (log.completed) {
        const logDate = new Date(log.date);
        
        weeks.forEach(week => {
          if (logDate >= week.start && logDate <= week.end) {
            week.completed += 1;
          }
        });
      }
    });
    
    // Calculate completion rates
    const weeklyData = weeks.map(week => ({
      ...week,
      rate: week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0
    }));
    
    // Calculate overall stats
    const totalHabits = weeks.reduce((sum, week) => sum + week.total, 0);
    const completedHabits = weeks.reduce((sum, week) => sum + week.completed, 0);
    const overallRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
    
    // Calculate progress compared to previous month
    const prevMonthStart = new Date(start);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    
    const prevMonthEnd = new Date(start);
    prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
    
    const prevMonthLogs = await HabitLog.find({
      user: req.user._id,
      date: { $gte: prevMonthStart, $lte: prevMonthEnd }
    });
    
    const prevMonthCompleted = prevMonthLogs.filter(log => log.completed).length;
    const completionChange = prevMonthCompleted > 0 
      ? Math.round(((completedHabits - prevMonthCompleted) / prevMonthCompleted) * 100)
      : 100;
    
    res.status(200).json({
      weeklyData,
      overall: {
        total: totalHabits,
        completed: completedHabits,
        rate: overallRate,
        change: completionChange
      },
      period: {
        start,
        end,
        month: start.toLocaleString('default', { month: 'long' }),
        year: start.getFullYear()
      }
    });
  } catch (error) {
    console.error('Monthly stats error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving monthly stats',
        status: 500
      }
    });
  }
};

// @desc    Get streak statistics
// @route   GET /api/stats/streaks
// @access  Private
export const getStreakStats = async (req, res) => {
  try {
    // Get all user's habits
    const habits = await Habit.find({
      user: req.user._id,
    });
    
    if (habits.length === 0) {
      return res.status(200).json({
        streaks: [],
        overall: {
          currentBest: 0,
          longestEver: 0
        }
      });
    }
    
    // Get all logs for these habits
    const logs = await HabitLog.find({
      user: req.user._id,
      habit: { $in: habits.map(h => h._id) }
    });
    
    // Calculate streaks
    const streakData = calculateStreaks(logs, habits);
    
    // Map streak data to habits
    const streaks = habits.map(habit => {
      const habitStreak = streakData[habit._id] || { current: 0, longest: 0 };
      return {
        habitId: habit._id,
        habitName: habit.name,
        icon: habit.icon,
        color: habit.color,
        currentStreak: habitStreak.current,
        longestStreak: habitStreak.longest,
        isArchived: habit.isArchived
      };
    });
    
    // Sort by current streak (descending)
    streaks.sort((a, b) => b.currentStreak - a.currentStreak);
    
    // Calculate overall best streaks
    const currentBest = streaks.reduce((max, habit) => 
      Math.max(max, habit.currentStreak), 0);
      
    const longestEver = streaks.reduce((max, habit) => 
      Math.max(max, habit.longestStreak), 0);
    
    res.status(200).json({
      streaks,
      overall: {
        currentBest,
        longestEver
      }
    });
  } catch (error) {
    console.error('Streak stats error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving streak stats',
        status: 500
      }
    });
  }
};

// @desc    Get overview statistics
// @route   GET /api/stats/overview
// @access  Private
export const getOverviewStats = async (req, res) => {
  try {
    // Get habits count
    const totalHabits = await Habit.countDocuments({
      user: req.user._id,
      isArchived: false
    });
    
    const archivedHabits = await Habit.countDocuments({
      user: req.user._id,
      isArchived: true
    });
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's completions
    const todayLogs = await HabitLog.find({
      user: req.user._id,
      date: { $gte: today, $lt: tomorrow },
      completed: true
    });
    
    // Get weekly date range
    const { start: weekStart } = getDateRange('week');
    
    // Get this week's completions
    const weeklyLogs = await HabitLog.find({
      user: req.user._id,
      date: { $gte: weekStart, $lte: tomorrow },
      completed: true
    });
    
    // Get all time completions
    const allTimeCompleted = await HabitLog.countDocuments({
      user: req.user._id,
      completed: true
    });
    
    // Get user's account creation date
    const accountAge = Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24)) || 1;
    
    // Calculate daily average
    const dailyAverage = Math.round((allTimeCompleted / accountAge) * 10) / 10;
    
    res.status(200).json({
      habits: {
        active: totalHabits,
        archived: archivedHabits,
        total: totalHabits + archivedHabits
      },
      completions: {
        today: todayLogs.length,
        thisWeek: weeklyLogs.length,
        allTime: allTimeCompleted,
        dailyAverage
      },
      dayStreak: 0, // Placeholder - would need more complex logic to determine
      accountAge,
      joinDate: req.user.createdAt
    });
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({
      error: {
        message: 'Server error retrieving overview stats',
        status: 500
      }
    });
  }
};