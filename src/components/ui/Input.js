import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    const id = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    const handleChange = (e) => {
      props.onChange?.(e);
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${widthClass} ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 bg-white dark:bg-gray-800 border 
            ${error ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-700'} 
            rounded-md focus:outline-none focus:ring-2 
            ${error ? 'focus:ring-red-500 dark:focus:ring-red-600' : 'focus:ring-teal-500 dark:focus:ring-teal-600'} 
            transition duration-200
          `}
          {...props}
          onChange={handleChange}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  onChange: PropTypes.func
};

export default Input;