import React from 'react';
import { Outlet } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            HabitFlow
          </h1>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;