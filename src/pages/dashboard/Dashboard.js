import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { useHabits } from '../../context/HabitContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card.js';
import Button from '../../components/ui/Button.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.js';
import HabitCard from '../habits/HabitCard.js';
import axios from 'axios';

const Dashboard = () => {
  const { habits, isLoading, fetchHabits } = useHabits();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits();

      // Fetch overview stats
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const response = await axios.get(`${apiUrl}/stats/overview`, {
            withCredentials: true
          });
          setStats(response.data);
        } catch (error) {
          console.error('Failed to fetch stats:', error);
          if (error.response?.status === 401) {
            // Handle unauthorized error
            setStats(null);
          }
        } finally {
          setStatsLoading(false);
        }
      };

      fetchStats();
    }
  }, [fetchHabits, apiUrl, isAuthenticated]);

  // Calculate today's date
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedDate = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  // Filter habits for today based on frequency
  const todaysHabits = habits.filter(habit => {
    const dayOfWeek = dayNames[today.getDay()].toLowerCase();
    return habit.frequency.includes(dayOfWeek);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">{formattedDate}</p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={18} />}
          as={Link}
          to="/habits/new"
        >
          Add Habit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-slide-up">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Habits</p>
                {statsLoading ? (
                  <div className="h-8 flex items-center"><LoadingSpinner size="small" /></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.habits.active || 0}
                  </p>
                )}
              </div>
              <div className="bg-teal-100 dark:bg-teal-900/40 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="animate-slide-up delay-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Completed</p>
                {statsLoading ? (
                  <div className="h-8 flex items-center"><LoadingSpinner size="small" /></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.completions.today || 0}
                  </p>
                )}
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="animate-slide-up delay-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Week</p>
                {statsLoading ? (
                  <div className="h-8 flex items-center"><LoadingSpinner size="small" /></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.completions.thisWeek || 0}
                  </p>
                )}
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="animate-slide-up delay-300">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Average</p>
                {statsLoading ? (
                  <div className="h-8 flex items-center"><LoadingSpinner size="small" /></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats?.completions.dailyAverage || 0}
                  </p>
                )}
              </div>
              <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Today's Habits */}
      <Card className="animate-slide-up delay-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Habits</CardTitle>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              {todaysHabits.length} habits
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : todaysHabits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysHabits.map((habit) => (
                <HabitCard key={habit._id} habit={habit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No habits scheduled for today.</p>
              <Button
                variant="outline"
                className="mt-4"
                icon={<Plus size={18} />}
                as={Link}
                to="/habits/new"
              >
                Add a new habit
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* All Active Habits */}
      <Card className="animate-slide-up delay-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Active Habits</CardTitle>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {habits.length} habits
            </span>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : habits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map((habit) => (
                <HabitCard key={habit._id} habit={habit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No habits found. Start building better habits today!</p>
              <Button
                variant="outline"
                className="mt-4"
                icon={<Plus size={18} />}
                as={Link}
                to="/habits/new"
              >
                Create your first habit
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;