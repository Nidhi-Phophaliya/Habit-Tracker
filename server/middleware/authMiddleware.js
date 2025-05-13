import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
  let token;

  // Get token from header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Not authorized to access this route',
        status: 401,
      },
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'habittrackersecret');

    // Get user from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          status: 401,
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Not authorized, token failed',
        status: 401,
      },
    });
  }
};

// Helper function to generate JWT
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'habittrackersecret', {
    expiresIn: '30d',
  });
};