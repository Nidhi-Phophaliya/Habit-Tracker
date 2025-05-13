import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import Button from '../../components/ui/Button.js';
import Input from '../../components/ui/Input.js';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form
    let formErrors = {};
    let hasErrors = false;
    
    if (!name) {
      formErrors.name = 'Name is required';
      hasErrors = true;
    }
    
    if (!email) {
      formErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }
    
    if (!password) {
      formErrors.password = 'Password is required';
      hasErrors = true;
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }
    
    if (password !== confirmPassword) {
      formErrors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setErrors(formErrors);
      return;
    }
    
    // Submit form
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    }
  };
  
  return (
    <div className="animate-slide-up">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Create an account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
            {errors.general}
          </div>
        )}
        
        <Input
          label="Name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          icon={<UserPlus size={18} />}
        >
          Create account
        </Button>
      </form>
      
      <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;