import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Sun, Moon, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

const TopBar = ({ openSidebar }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={openSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            HabitFlow
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <Link
            to="/profile"
            className="flex items-center space-x-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

TopBar.propTypes = {
  openSidebar: PropTypes.func.isRequired
};

export default TopBar;