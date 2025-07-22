// serverside/routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Register route - POST /api/auth/register
router.post('/register', registerUser);

// Login route - POST /api/auth/login
router.post('/login', loginUser);

export default router;
