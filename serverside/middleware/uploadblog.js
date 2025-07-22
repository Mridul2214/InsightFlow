// serverside/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Make sure this path is correct

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
};


// exports.checkUserBanStatus = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (user.isBanned) {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Your account is banned from uploading content' 
//       });
//     }
//     next();
//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to verify account status' 
//     });
//   }
// };