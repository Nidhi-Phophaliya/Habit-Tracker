import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash, Archive, Check, 
  Calendar, BarChart2, Clock, ChevronLeft, ChevronRight 
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import dayjs from 'dayjs';
import { useHabits } from '../../context/HabitContext.js';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card.js';
import Button from '../../components/ui/Button.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.js';

const HabitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchHabitById, deleteHabit, archiveHabit, toggleCompletion, getHabitLogs } = useHabits();
  
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  useEffect(() => {
    if (!id) return;
    
    const loadHabitAndLogs = async () => {
      try {
        setIsLoading(true);
        const habitData = await fetchHabitById(id);
        setHabit(habitData);
        
        // Get start and end dates for the month
        const startDate = currentDate.startOf('month').format('YYYY-MM-DD');
        const endDate = currentDate.endOf('month').format('YYYY-MM-DD');
        
        const habitLogs = await getHabitLogs(id, startDate, endDate);
        setLogs(habitLogs);
      } catch (error) {
        console.error('Error loading habit details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHabitAndLogs();
  }, [id, fetchHabitById, getHabitLogs, currentDate]);
  
  const handleDelete = async () => {
    if (!habit) return;
    
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      try {
        await deleteHabit(habit._id);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };
  
  const handleArchive = async () => {
    if (!habit) return;
    
    try {
      await archiveHabit(habit._id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error archiving habit:', error);
    }
  };
  
  const handleToggleCompletion = async () => {
    if (!habit) return;
    
    try {
      await toggleCompletion(habit, !habit.completedToday);
      setHabit({
        ...habit,
        completedToday: !habit.completedToday
      });
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };
  
  const changeMonth = (increment) => {
    setCurrentDate(currentDate.add(increment, 'month'));
  };
  
  // Format frequency for display
  const formatFrequency = (frequency) => {
    if (frequency.length === 7) return 'Every day';
    
    if (frequency.length === 5 && 
        frequency.includes('monday') && 
        frequency.includes('tuesday') && 
        frequency.includes('wednesday') && 
        frequency.includes('thursday') && 
        frequency.includes('friday')) {
      return 'Weekdays';
    }
    
    if (frequency.length === 2 && 
        frequency.includes('saturday') && 
        frequency.includes('sunday')) {
      return 'Weekends';
    }
    
    // Full names for days
    const dayMap = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    
    return frequency.map(day => dayMap[day] || day).join(', ');
  };
  
  // Generate calendar for current month
  const generateCalendar = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const daysInMonth = endOfMonth.date();
    
    const startDayOfWeek = startOfMonth.day() || 7; // Convert Sunday (0) to 7 for easier calculation
    
    // Create a map of date strings to completed status
    const completionMap = {};
    logs.forEach(log => {
      const dateStr = dayjs(log.date).format('YYYY-MM-DD');
      completionMap[dateStr] = log.completed;
    });
    
    // Generate calendar days
    const calendarDays = [];
    
    // Add empty cells for days before the start of the month
    for (let i = 1; i < startDayOfWeek; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentDate.date(day);
      const dateStr = date.format('YYYY-MM-DD');
      const isToday = date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
      const isCompleted = completionMap[dateStr];
      
      // Check if this day is in the habit's frequency
      const dayName = date.format('dddd').toLowerCase();
      const isInFrequency = habit?.frequency.includes(dayName);
      
      let bgClass = '';
      if (isCompleted) {
        bgClass = `bg-${habit?.color || 'teal'}-100 dark:bg-${habit?.color || 'teal'}-900/30 text-${habit?.color || 'teal'}-700 dark:text-${habit?.color || 'teal'}-400`;
      } else if (isInFrequency) {
        bgClass = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      }
      
      calendarDays.push(
        <div 
          key={`day-${day}`}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
            ${isToday ? 'ring-2 ring-teal-500 dark:ring-teal-400' : ''}
            ${bgClass}
            ${isCompleted ? 'relative' : ''}
          `}
        >
          {day}
          {isCompleted && (
            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400"></span>
          )}
        </div>
      );
    }
    
    return calendarDays;
  };
  
  if (isLoading || !habit) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  // Get the icon component from Lucide
  const IconComponent = LucideIcons[habit.icon] || LucideIcons.CheckCircle;
  
  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          as={Link}
          to="/dashboard"
          icon={<ArrowLeft size={16} />}
        >
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {habit.name}
          </h1>
          
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleToggleCompletion}
              icon={<Check size={16} />}
            >
              {habit.completedToday ? 'Completed' : 'Mark Complete'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              as={Link}
              to={`/habits/${habit._id}/edit`}
              icon={<Edit size={16} />}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Habit Overview</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-start mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-${habit.color}-100 text-${habit.color}-600 dark:bg-${habit.color}-900/30 dark:text-${habit.color}-400`}>
                <IconComponent className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {habit.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Frequency
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFrequency(habit.frequency)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <BarChart2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Streak
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    0 days {/* This would be calculated from logs */}
                  </p>
                </div>
              </div>
              
              {habit.reminderTime && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reminder
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {habit.reminderTime}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Started
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dayjs(habit.createdAt).format('MMMM D, YYYY')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Calendar
              </h3>
              
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentDate.format('MMMM YYYY')}
                </h4>
                
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">M</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">T</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">W</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">T</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">F</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">S</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">S</div>
                
                {generateCalendar()}
              </div>
              
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Not Scheduled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Scheduled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-${habit.color}-100 dark:bg-${habit.color}-900/30`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Button
                variant="outline"
                fullWidth
                as={Link}
                to={`/habits/${habit._id}/edit`}
                icon={<Edit size={18} />}
              >
                Edit Habit
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={handleArchive}
                icon={<Archive size={18} />}
              >
                Archive Habit
              </Button>
              
              <Button
                variant="danger"
                fullWidth
                onClick={handleDelete}
                icon={<Trash size={18} />}
              >
                Delete Habit
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default HabitDetails;