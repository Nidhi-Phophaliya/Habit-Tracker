import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import { useTheme } from './context/ThemeContext.js';

// Layout Components
import Layout from './components/layout/Layout.js';
import AuthLayout from './components/layout/AuthLayout.js';

// Page Components
import Login from './pages/auth/Login.js';
import Register from './pages/auth/Register.js';
import Dashboard from './pages/dashboard/Dashboard.js';
import HabitDetails from './pages/habits/HabitDetails.js';
import HabitForm from './pages/habits/HabitForm.js';
import Stats from './pages/stats/Stats.js';
import Profile from './pages/profile/Profile.js';
import NotFound from './pages/NotFound.js';
import LandingPage from './pages/LandingPage.js';

function App() {
  const { isAuthenticated, checkAuth } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    checkAuth(); // Check auth status on load
    document.documentElement.classList.toggle('dark', theme === 'dark'); // Set theme
  }, [checkAuth, theme]);

  return (
    <Routes>
      {/* Public Routes with Auth Layout */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
      </Route>

      {/* Protected Routes with Main Layout */}
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="habits">
          <Route path="new" element={<HabitForm />} />
          <Route path=":id" element={<HabitDetails />} />
          <Route path=":id/edit" element={<HabitForm />} />
        </Route>
        <Route path="stats" element={<Stats />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch-All Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
