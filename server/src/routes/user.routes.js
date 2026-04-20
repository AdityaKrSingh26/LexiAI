import express from 'express';
import {
    register,
    login,
    logout
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiting.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Auth routes with rate limiting and validation
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', authMiddleware, logout);

export default router;