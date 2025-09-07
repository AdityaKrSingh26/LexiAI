import express from 'express';
import {
    register,
    login,
    logout
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiting.js';

const router = express.Router();

// Auth routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authMiddleware, logout);

export default router;