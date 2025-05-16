import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-black/60 backdrop-blur-md rounded-2xl px-8 py-12 shadow-2xl max-w-md w-full text-center mx-auto">
      {/* Logo Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center shadow-md">
          <CheckCircle className="text-white w-6 h-6" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
        Welcome to <span className="text-teal-400">HabitFlow</span>
      </h1>

      {/* Subtitle */}
      <p className="text-white/80 text-sm sm:text-base mb-6">
        Track your habits. Stay consistent. Reach your goals with ease.
      </p>

      {/* CTA Buttons */}
      <div className="flex justify-center gap-4">
        <Link
          to="/login"
          className="bg-teal-500 hover:bg-teal-600 px-5 py-2 text-sm font-medium text-white rounded-full transition shadow"
        >
          Get Started
        </Link>
        <Link
          to="/register"
          className="bg-white hover:bg-gray-100 px-5 py-2 text-sm font-medium text-teal-700 rounded-full transition shadow"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
