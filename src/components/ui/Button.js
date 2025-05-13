import React from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner.js';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  icon,
  onClick,
  className = '',
  as: Component = 'button',
  ...props
}) => {
  const baseClasses = 'rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    outline: 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const disabledClass = disabled || isLoading 
    ? 'opacity-70 cursor-not-allowed' 
    : '';
  
  const buttonProps = {
    type: Component === 'button' ? type : undefined,
    className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`,
    onClick,
    disabled: disabled || isLoading,
    ...props
  };
  
  return (
    <Component {...buttonProps}>
      {isLoading ? (
        <>
          <LoadingSpinner size="small" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </Component>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  as: PropTypes.elementType
};

export default Button;