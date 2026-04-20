import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const authMiddleware = (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        console.warn('🚫 No authorization header provided');
        return res.status(401).json({ 
            success: false,
            message: 'No token provided' 
        });
    }

    // Handle Bearer token format
    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    // Log token info for debugging (first 20 characters only)
    console.log('🔐 Received token:', token.substring(0, 20) + '...');

    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET not configured');
        return res.status(500).json({ 
            success: false,
            message: 'Server configuration error' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error('🚫 Token verification failed:', err.message);
            return res.status(401).json({ 
                success: false,
                message: 'Failed to authenticate token' 
            });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                console.error('🚫 User not found for token:', decoded.id);
                return res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }
            
            console.log('✅ Authentication successful for user:', user.email);
            req.user = user;
            next();
        } catch (error) {
            console.error('❌ Database error in auth middleware:', error.message);
            return res.status(500).json({ 
                success: false,
                message: 'Internal server error' 
            });
        }
    });
};

export default authMiddleware;