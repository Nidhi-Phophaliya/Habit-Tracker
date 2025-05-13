import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Check, MoreVertical, Edit, Trash } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useHabits } from '../../context/HabitContext.js';
import Button from '../../components/ui/Button.js';

const HabitCard = ({ habit }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleCompletion, deleteHabit } = useHabits();
  
  // Get the icon component from Lucide
  const IconComponent = LucideIcons[habit.icon] || LucideIcons.CheckCircle;
  
  const colorClasses = {
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
  };
  
  const iconColor = colorClasses[habit.color] || colorClasses.teal;
  
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
    
    // Short names for days
    const dayMap = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    
    return frequency.map(day => dayMap[day] || day).join(', ');
  };
  
  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await toggleCompletion(habit, !habit.completedToday);
    } catch (error) {
      console.error('Error toggling habit completion:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      try {
        await deleteHabit(habit._id);
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };
  
  return (
    <div className="card habit-card group">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <Link to={`/habits/${habit._id}`} className="font-medium text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {habit.name}
            </Link>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <Link
                    to={`/habits/${habit._id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Link>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete();
                    }}
                  >
                    <Trash className="w-4 h-4 mr-2" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {habit.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {habit.description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatFrequency(habit.frequency)}
          </span>
          
          <Button
            variant={habit.completedToday ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggle}
            isLoading={isLoading}
            icon={habit.completedToday ? <Check className="w-4 h-4" /> : null}
          >
            {habit.completedToday ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

HabitCard.propTypes = {
  habit: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    frequency: PropTypes.arrayOf(PropTypes.string).isRequired,
    reminderTime: PropTypes.string,
    isArchived: PropTypes.bool.isRequired,
    startDate: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    completedToday: PropTypes.bool
  }).isRequired
};

export default HabitCard;