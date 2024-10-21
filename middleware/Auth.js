// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/Users.js'; // Adjust the path according to your structure

export const authenticate = (req, res, next) => {
  const token = req.cookies.token; // Access the token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    // Find the user and attach to the request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = user; // Attach user to request
    next(); // Proceed to the next middleware or route handler
  });
};
