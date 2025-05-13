import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button.js';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Button 
            variant="primary" 
            as={Link} 
            to="/"
            icon={<Home size={18} />}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;