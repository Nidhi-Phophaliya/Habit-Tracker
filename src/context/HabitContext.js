import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.js';

const HabitContext = createContext(undefined);

const GUEST_HABITS_KEY = 'guest_habits';

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, checkAuth } = useAuth();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Set up axios with credentials
  axios.defaults.withCredentials = true;

  // Fetch all habits
  const fetchHabits = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/habits`, {
        withCredentials: true
      });
      setHabits(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid, try to refresh auth
        await checkAuth();
      }
      const message = error.response?.data?.error?.message || 'Failed to fetch habits';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, isAuthenticated, checkAuth]);

  // Load guest habits from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem(GUEST_HABITS_KEY);
      setHabits(stored ? JSON.parse(stored) : []);
    }
  }, [isAuthenticated]);

  // Sync guest habits to backend on login
  useEffect(() => {
    if (isAuthenticated) {
      const stored = localStorage.getItem(GUEST_HABITS_KEY);
      if (stored) {
        const guestHabits = JSON.parse(stored);
        (async () => {
          for (const habit of guestHabits) {
            const { _id, completedToday, ...habitData } = habit;
            try {
              await axios.post(`${apiUrl}/habits`, habitData);
            } catch (e) { }
          }
          localStorage.removeItem(GUEST_HABITS_KEY);
          fetchHabits();
        })();
      }
    }
  }, [isAuthenticated, apiUrl, fetchHabits]);

  // Save guest habits to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(GUEST_HABITS_KEY, JSON.stringify(habits));
    }
  }, [habits, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits();
    } else {
      // handled by guest mode above
    }
  }, [isAuthenticated, fetchHabits]);

  // Fetch single habit by ID
  const fetchHabitById = async (id) => {
    if (!isAuthenticated) {
      return habits.find(h => h._id === id);
    }
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/habits/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to fetch habit';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create new habit
  const createHabit = async (habit) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${apiUrl}/habits`, habit, {
        withCredentials: true
      });
      setHabits([...habits, response.data]);
      toast.success('Habit created successfully');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid, try to refresh auth
        await checkAuth();
        toast.error('Session expired. Please try again.');
      } else {
        const message = error.response?.data?.error?.message || 'Failed to create habit';
        toast.error(message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update habit
  const updateHabit = async (id, habit) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${apiUrl}/habits/${id}`, habit, {
        withCredentials: true
      });
      setHabits(habits.map(h => (h._id === id ? response.data : h)));
      toast.success('Habit updated successfully');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await checkAuth();
        toast.error('Session expired. Please try again.');
      } else {
        const message = error.response?.data?.error?.message || 'Failed to update habit';
        toast.error(message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete habit
  const deleteHabit = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`${apiUrl}/habits/${id}`, {
        withCredentials: true
      });
      setHabits(habits.filter(h => h._id !== id));
      toast.success('Habit deleted successfully');
    } catch (error) {
      if (error.response?.status === 401) {
        await checkAuth();
        toast.error('Session expired. Please try again.');
      } else {
        const message = error.response?.data?.error?.message || 'Failed to delete habit';
        toast.error(message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle habit completion
  const toggleCompletion = async (habit, completed) => {
    if (!isAuthenticated) {
      toast.error('Please log in to track habits');
      throw new Error('Authentication required');
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post(`${apiUrl}/habits/${habit._id}/log`, {
        date: today,
        completed,
      });
      setHabits(habits.map(h => h._id === habit._id ? { ...h, completedToday: completed } : h));
      toast.success(completed ? 'Habit marked as complete' : 'Habit marked as incomplete');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to update habit status';
      toast.error(message);
      throw error;
    }
  };

  // Archive habit
  const archiveHabit = async (id) => {
    if (!isAuthenticated) {
      setHabits(habits.filter(h => h._id !== id));
      toast.success('Habit archived successfully (guest)');
      return;
    }
    try {
      setIsLoading(true);
      await axios.patch(`${apiUrl}/habits/${id}/archive`);
      setHabits(habits.filter(h => h._id !== id));
      toast.success('Habit archived successfully');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to archive habit';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unarchive habit
  const unarchiveHabit = async (id) => {
    if (!isAuthenticated) {
      toast.success('Habit unarchived successfully (guest)');
      return;
    }
    try {
      setIsLoading(true);
      await axios.patch(`${apiUrl}/habits/${id}/unarchive`);
      fetchHabits();
      toast.success('Habit unarchived successfully');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to unarchive habit';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get habit logs
  const getHabitLogs = async (habitId, startDate, endDate) => {
    if (!isAuthenticated) {
      // Guest mode: no logs
      return [];
    }
    try {
      setIsLoading(true);
      let url = `${apiUrl}/habits/${habitId}/logs`;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to fetch habit logs';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        isLoading,
        fetchHabits,
        fetchHabitById,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        archiveHabit,
        unarchiveHabit,
        getHabitLogs,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

HabitProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};