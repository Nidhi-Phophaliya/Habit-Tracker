import React, { createContext, useState, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Set up axios with credentials
  axios.defaults.withCredentials = true;

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/auth/me`);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Login user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
      });
      
      setUser(response.data);
      setIsAuthenticated(true);
      toast.success('Login successful! Welcome back.');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register user
  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${apiUrl}/auth/register`, {
        name,
        email,
        password,
      });
      
      setUser(response.data);
      setIsAuthenticated(true);
      toast.success('Registration successful! Welcome to HabitFlow.');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setIsLoading(true);
      await axios.post(`${apiUrl}/auth/logout`);
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully.');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (userData) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${apiUrl}/auth/update-profile`, userData);
      setUser(response.data);
      toast.success('Profile updated successfully.');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Profile update failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      await axios.put(`${apiUrl}/auth/update-password`, {
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully.');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Password update failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};