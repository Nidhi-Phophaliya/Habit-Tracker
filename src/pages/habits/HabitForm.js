import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useHabits } from '../../context/HabitContext.js';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card.js';
import Button from '../../components/ui/Button.js';
import Input from '../../components/ui/Input.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.js';

const HabitForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createHabit, updateHabit, fetchHabitById, isLoading } = useHabits();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'CheckCircle',
    color: 'teal',
    frequency: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    reminderTime: '',
  });

  const [errors, setErrors] = useState({});

  const [pageLoading, setPageLoading] = useState(true);

  // Fetch habit data if editing
  useEffect(() => {
    const loadHabit = async () => {
      if (id) {
        try {
          setPageLoading(true);
          const habit = await fetchHabitById(id);
          setFormData({
            name: habit.name,
            description: habit.description || '',
            icon: habit.icon,
            color: habit.color,
            frequency: habit.frequency,
            reminderTime: habit.reminderTime || '',
          });
        } catch (error) {
          console.error('Error fetching habit:', error);
          setErrors({ general: 'Failed to load habit data' });
        } finally {
          setPageLoading(false);
        }
      } else {
        setPageLoading(false);
      }
    };

    loadHabit();
  }, [id, fetchHabitById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFrequencyChange = (day) => {
    const updatedFrequency = formData.frequency.includes(day)
      ? formData.frequency.filter(d => d !== day)
      : [...formData.frequency, day];

    setFormData({ ...formData, frequency: updatedFrequency });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate form
    let formErrors = {};
    let hasErrors = false;

    if (!formData.name.trim()) {
      formErrors.name = 'Habit name is required';
      hasErrors = true;
    }

    if (formData.frequency.length === 0) {
      formErrors.frequency = 'Select at least one day of the week';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(formErrors);
      return;
    }

    try {
      if (id) {
        // Update existing habit
        const updatedHabit = await updateHabit(id, formData);
        navigate(`/habits/${updatedHabit._id}`);
      } else {
        // Create new habit
        const newHabit = await createHabit(formData);
        navigate(`/habits/${newHabit._id}`);
      }
    } catch (error) {
      console.error('Error saving habit:', error);
      setErrors({
        general: error.response?.data?.error?.message ||
          'Failed to save habit. Please try again.'
      });
    }
  };

  // Available habit icons
  const iconOptions = [
    'CheckCircle', 'Book', 'Coffee', 'Droplet', 'Dumbbell', 'Heart',
    'Music', 'PenTool', 'Smile', 'Sun', 'Moon', 'Zap', 'BookOpen',
    'Brain', 'Apple', 'Bike', 'SunMedium', 'BedDouble', 'Clock', 'Utensils'
  ];

  // Available colors
  const colorOptions = [
    { name: 'teal', color: 'bg-teal-500' },
    { name: 'purple', color: 'bg-purple-500' },
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'orange', color: 'bg-orange-500' },
    { name: 'red', color: 'bg-red-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'indigo', color: 'bg-indigo-500' },
    { name: 'pink', color: 'bg-pink-500' },
  ];

  // Days of the week
  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  // Preset frequency options
  const frequencyPresets = [
    { name: 'Every day', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    { name: 'Weekdays', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
    { name: 'Weekends', days: ['saturday', 'sunday'] },
  ];

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          as={Link}
          to={id ? `/habits/${id}` : '/dashboard'}
          icon={<ArrowLeft size={16} />}
        >
          Back
        </Button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          {id ? 'Edit Habit' : 'Create New Habit'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Habit Details' : 'New Habit Details'}</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            <Input
              label="Habit Name"
              name="name"
              placeholder="e.g., Drink Water, Read, Exercise..."
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                placeholder="Add details about your habit"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600 transition duration-200"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {iconOptions.map((iconName) => {
                  const Icon = LucideIcons[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={`p-2 rounded-md flex items-center justify-center transition-colors ${formData.icon === iconName
                        ? `bg-${formData.color}-100 text-${formData.color}-600 dark:bg-${formData.color}-900/30 dark:text-${formData.color}-400 ring-2 ring-${formData.color}-500`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={`w-8 h-8 rounded-full ${option.color} transition-transform ${formData.color === option.name ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600 scale-110' : ''
                      }`}
                    onClick={() => setFormData({ ...formData, color: option.name })}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequency
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {frequencyPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className={`px-3 py-1 text-sm rounded-md ${JSON.stringify(formData.frequency.sort()) === JSON.stringify(preset.days.sort())
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    onClick={() => setFormData({ ...formData, frequency: [...preset.days] })}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={day.id}
                      checked={formData.frequency.includes(day.id)}
                      onChange={() => handleFrequencyChange(day.id)}
                      className="w-4 h-4 text-teal-600 dark:text-teal-500 border-gray-300 dark:border-gray-700 focus:ring-teal-500 dark:focus:ring-teal-600 rounded"
                    />
                    <label htmlFor={day.id} className="ml-2 text-gray-700 dark:text-gray-300">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>

              {errors.frequency && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.frequency}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reminder Time (optional)
              </label>
              <input
                type="time"
                name="reminderTime"
                value={formData.reminderTime}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600 transition duration-200"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Set a time to receive reminders for this habit
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                as={Link}
                to={id ? `/habits/${id}` : '/dashboard'}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                icon={<Save size={18} />}
              >
                {id ? 'Update Habit' : 'Create Habit'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default HabitForm;