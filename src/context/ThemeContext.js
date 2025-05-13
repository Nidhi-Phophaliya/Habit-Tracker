import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  // Get saved theme from localStorage or use system default
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    
    return 'system';
  });

  // Apply theme when it changes
  useEffect(() => {
    if (theme === 'system') {
      // Use system preference
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Initial application
      if (darkModeQuery.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Listen for changes
      const handleChange = (e) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      darkModeQuery.addEventListener('change', handleChange);
      
      return () => {
        darkModeQuery.removeEventListener('change', handleChange);
      };
    } else {
      // Apply specific theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Save theme to localStorage
  const setTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};