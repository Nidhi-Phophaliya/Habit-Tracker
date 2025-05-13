import React, { useState, useEffect } from 'react';
import { Save, Key, Moon, Sun, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card.js';
import Button from '../../components/ui/Button.js';
import Input from '../../components/ui/Input.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner.js';

const Profile = () => {
  const { user, updateProfile, updatePassword, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    profilePicture: '',
    timezone: '',
    preferences: {
      theme: 'system',
      reminderTime: '20:00',
      weekStart: 'monday'
    }
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        profilePicture: user.profilePicture || '',
        timezone: user.timezone || '',
        preferences: {
          theme: user.preferences?.theme || 'system',
          reminderTime: user.preferences?.reminderTime || '20:00',
          weekStart: user.preferences?.weekStart || 'monday'
        }
      });
    }
  }, [user]);
  
  // Syncing theme preference with theme context
  useEffect(() => {
    if (profileForm.preferences.theme !== theme) {
      setTheme(profileForm.preferences.theme);
    }
  }, [profileForm.preferences.theme, setTheme, theme]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileForm({
        ...profileForm,
        [parent]: {
          ...profileForm[parent],
          [child]: value
        }
      });
    } else {
      setProfileForm({
        ...profileForm,
        [name]: value
      });
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess(false);
    
    // Validate form
    let formErrors = {};
    let hasErrors = false;
    
    if (!profileForm.name.trim()) {
      formErrors.name = 'Name is required';
      hasErrors = true;
    }
    
    if (!profileForm.email.trim()) {
      formErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      formErrors.email = 'Please enter a valid email';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setProfileErrors(formErrors);
      return;
    }
    
    try {
      await updateProfile(profileForm);
      setProfileSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    } catch (error) {
      setProfileErrors({ general: 'Failed to update profile. Please try again.' });
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);
    
    // Validate form
    let formErrors = {};
    let hasErrors = false;
    
    if (!passwordForm.currentPassword) {
      formErrors.currentPassword = 'Current password is required';
      hasErrors = true;
    }
    
    if (!passwordForm.newPassword) {
      formErrors.newPassword = 'New password is required';
      hasErrors = true;
    } else if (passwordForm.newPassword.length < 6) {
      formErrors.newPassword = 'Password must be at least 6 characters';
      hasErrors = true;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setPasswordErrors(formErrors);
      return;
    }
    
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (error) {
      setPasswordErrors({ general: 'Failed to update password. The current password might be incorrect.' });
    }
  };
  
  // Theme options
  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun size={18} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={18} /> },
    { value: 'system', label: 'System Default', icon: <Clock size={18} /> },
  ];
  
  // Week start options
  const weekStartOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'sunday', label: 'Sunday' },
  ];
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileErrors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                {profileErrors.general}
              </div>
            )}
            
            {profileSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-sm">
                Profile updated successfully!
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                error={profileErrors.name}
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                error={profileErrors.email}
              />
            </div>
            
            <Input
              label="Profile Picture URL (optional)"
              name="profilePicture"
              placeholder="https://example.com/profile.jpg"
              value={profileForm.profilePicture}
              onChange={handleProfileChange}
            />
            
            <Input
              label="Timezone (optional)"
              name="timezone"
              value={profileForm.timezone}
              onChange={handleProfileChange}
              placeholder="UTC"
            />
            
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                icon={<Save size={18} />}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      
      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex items-center justify-between px-4 py-2 border rounded-md ${
                      profileForm.preferences.theme === option.value
                        ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleProfileChange({ target: { name: 'preferences.theme', value: option.value } })}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-600 dark:text-gray-300 mr-2">{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                    {profileForm.preferences.theme === option.value && (
                      <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Reminder Time
                </label>
                <input
                  type="time"
                  name="preferences.reminderTime"
                  value={profileForm.preferences.reminderTime}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600 transition duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Week Starts On
                </label>
                <select
                  name="preferences.weekStart"
                  value={profileForm.preferences.weekStart}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600 transition duration-200"
                >
                  {weekStartOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                isLoading={isLoading}
                icon={<Save size={18} />}
                onClick={handleProfileSubmit}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordErrors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                {passwordErrors.general}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-sm">
                Password changed successfully!
              </div>
            )}
            
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
              placeholder="Enter your current password"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                placeholder="Enter new password"
              />
              
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                placeholder="Confirm new password"
              />
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                icon={<Key size={18} />}
              >
                Update Password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4">
        Account created on {new Date(user.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default Profile;