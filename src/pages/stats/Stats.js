import React, { useState, useEffect } from 'react';
import { Calendar, BarChart2, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.js';
import { Bar, Line } from 'react-chartjs-2';
import { useHabits } from '../../context/HabitContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function getDayName(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function getWeekLabel(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;
}

const Stats = () => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [streakStats, setStreakStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { habits } = useHabits();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      if (isAuthenticated) {
        try {
          // Fetch weekly stats
          const weeklyResponse = await axios.get(`${apiUrl}/stats/weekly`);
          setWeeklyStats(weeklyResponse.data);
          // Fetch monthly stats
          const monthlyResponse = await axios.get(`${apiUrl}/stats/monthly`);
          setMonthlyStats(monthlyResponse.data);
          // Fetch streak stats
          const streakResponse = await axios.get(`${apiUrl}/stats/streaks`);
          setStreakStats(streakResponse.data);
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest mode: calculate stats from habits
        // Weekly stats (last 7 days)
        const today = new Date();
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          return d;
        });
        const dailyData = days.map(day => {
          const completed = habits.filter(h => h.completedToday && new Date().toDateString() === day.toDateString()).length;
          const total = habits.length;
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
          return {
            day: getDayName(day),
            completed,
            total,
            rate,
          };
        });
        setWeeklyStats({
          overall: {
            rate: dailyData.reduce((acc, d) => acc + d.rate, 0) / 7,
            completed: dailyData.reduce((acc, d) => acc + d.completed, 0),
            total: dailyData.reduce((acc, d) => acc + d.total, 0),
          },
          dailyData,
        });
        // Monthly stats (last 4 weeks)
        const weeks = Array.from({ length: 4 }, (_, i) => {
          const start = new Date(today);
          start.setDate(today.getDate() - (7 * (3 - i)));
          return start;
        });
        const weeklyData = weeks.map(weekStart => {
          const completed = habits.filter(h => h.completedToday).length; // crude guest logic
          const total = habits.length;
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
          return {
            label: getWeekLabel(weekStart),
            completed,
            total,
            rate,
          };
        });
        setMonthlyStats({
          overall: {
            rate: weeklyData.reduce((acc, w) => acc + w.rate, 0) / 4,
            change: 0,
          },
          period: {
            month: today.toLocaleString(undefined, { month: 'long' }),
            year: today.getFullYear(),
          },
          weeklyData,
        });
        // Streak stats (guest: just count consecutive completedToday)
        let currentStreak = 0;
        let longestStreak = 0;
        habits.forEach(h => {
          if (h.completedToday) {
            currentStreak += 1;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        });
        setStreakStats({
          overall: {
            currentBest: currentStreak,
            longestEver: longestStreak,
          },
          streaks: habits.map(h => ({
            habitName: h.name,
            currentStreak: h.completedToday ? 1 : 0,
            longestStreak: h.completedToday ? 1 : 0,
            isArchived: false,
            color: h.color || 'teal',
            icon: h.icon || 'CheckCircle',
          })),
        });
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [apiUrl, isAuthenticated, habits]);

  const weeklyChartData = {
    labels: weeklyStats?.dailyData.map(day => day.day) || [],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: weeklyStats?.dailyData.map(day => day.rate) || [],
        backgroundColor: 'rgba(13, 148, 136, 0.8)',
        borderColor: 'rgba(13, 148, 136, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyStats?.weeklyData.map(week => week.label) || [],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: monthlyStats?.weeklyData.map(week => week.rate) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + '%';
          }
        }
      }
    }
  };

  // Get top 5 streaks
  const topStreaks = streakStats?.streaks
    .filter(streak => !streak.isArchived)
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your habit completion and progress</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {weeklyStats?.overall.rate || 0}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {weeklyStats?.overall.completed || 0} of {weeklyStats?.overall.total || 0} habits
                </p>
              </div>
              <div className="bg-teal-100 dark:bg-teal-900/40 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {monthlyStats?.overall.rate || 0}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {monthlyStats?.period?.month || ''} {monthlyStats?.period?.year || ''}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full">
                <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {streakStats?.overall.currentBest || 0} days
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Longest ever: {streakStats?.overall.longestEver || 0} days
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Stats Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'weekly'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'monthly'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'streaks'
              ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          onClick={() => setActiveTab('streaks')}
        >
          Streaks
        </button>
      </div>

      {/* Stats Content */}
      <div className="animate-slide-up">
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Completion Rate</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="h-80">
                  <Bar data={weeklyChartData} options={chartOptions} />
                </div>
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Overall weekly completion rate: {weeklyStats?.overall.rate || 0}%
                </div>
              </CardBody>
            </Card>

            {/* Daily Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Breakdown</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3">Day</th>
                        <th className="px-4 py-3">Completed</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyStats?.dailyData.map((day, index) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3 font-medium">{day.day}</td>
                          <td className="px-4 py-3">{day.completed}</td>
                          <td className="px-4 py-3">{day.total}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                                <div
                                  className="bg-teal-600 dark:bg-teal-500 h-2.5 rounded-full"
                                  style={{ width: `${day.rate}%` }}
                                ></div>
                              </div>
                              <span>{day.rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Monthly Progress</CardTitle>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {monthlyStats?.period.month} {monthlyStats?.period.year}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="h-80">
                  <Bar data={monthlyChartData} options={chartOptions} />
                </div>
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Monthly completion rate: {monthlyStats?.overall.rate || 0}%
                  {monthlyStats?.overall.change !== undefined && (
                    <span className={`ml-2 ${monthlyStats.overall.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {monthlyStats.overall.change >= 0 ? '+' : ''}{monthlyStats.overall.change}% from last month
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Weekly Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Breakdown</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3">Week</th>
                        <th className="px-4 py-3">Completed</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyStats?.weeklyData.map((week, index) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                          <td className="px-4 py-3 font-medium">{week.label}</td>
                          <td className="px-4 py-3">{week.completed}</td>
                          <td className="px-4 py-3">{week.total}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                                <div
                                  className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full"
                                  style={{ width: `${week.rate}%` }}
                                ></div>
                              </div>
                              <span>{week.rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'streaks' && (
          <div className="space-y-6">
            {/* Top Streaks */}
            <Card>
              <CardHeader>
                <CardTitle>Top Streaks</CardTitle>
              </CardHeader>
              <CardBody>
                {topStreaks.length > 0 ? (
                  <div className="space-y-4">
                    {topStreaks.map((streak, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${streak.color}-100 text-${streak.color}-600 dark:bg-${streak.color}-900/30 dark:text-${streak.color}-400`}>
                            {LucideIcons[streak.icon] ? React.createElement(LucideIcons[streak.icon], { size: 20 }) : <TrendingUp size={20} />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{streak.habitName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Longest: {streak.longestStreak} days
                            </p>
                          </div>
                        </div>
                        <div>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">{streak.currentStreak}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No streaks to display. Keep logging your habits consistently to build streaks!
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Streaks Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Streaks Summary</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Best Streak</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{streakStats?.overall.currentBest || 0} days</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Longest Ever Streak</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{streakStats?.overall.longestEver || 0} days</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">All Streaks</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3">Habit</th>
                          <th className="px-4 py-3">Current Streak</th>
                          <th className="px-4 py-3">Longest Streak</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {streakStats?.streaks.map((streak, index) => (
                          <tr key={index} className="border-b dark:border-gray-700">
                            <td className="px-4 py-3 font-medium">{streak.habitName}</td>
                            <td className="px-4 py-3">{streak.currentStreak} days</td>
                            <td className="px-4 py-3">{streak.longestStreak} days</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${streak.isArchived
                                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                }`}>
                                {streak.isArchived ? 'Archived' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;