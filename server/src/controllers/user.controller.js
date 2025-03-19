import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Generate JWT Token with error handling
const generateToken = (id) => {
    console.log(`[generateToken] Generating JWT token for user: ${id}`);
    try {
        if (!process.env.JWT_SECRET) {
            console.error('[generateToken] JWT_SECRET environment variable is missing');
            throw new Error('JWT configuration error: Secret key is missing');
        }

        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        console.log(`[generateToken] Token successfully generated for user: ${id}`);
        return token;
    } catch (error) {
        console.error('[generateToken] Failed to generate token:', {
            userId: id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw error; // Re-throw for proper handling in calling function
    }
};

// Register User
export const register = async (req, res) => {
    console.log('[register] Processing user registration request');
    try {
        const { username, email, password } = req.body;

        // Validate input fields
        if (!username || !email || !password) {
            console.error('[register] Missing required fields:', {
                hasUsername: !!username,
                hasEmail: !!email,
                hasPassword: !!password
            });
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email and password'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('[register] Invalid email format:', { email });
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Password strength validation
        if (password.length < 6) {
            console.error('[register] Password too short');
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        console.log(`[register] Checking if user exists: ${email}, ${username}`);
        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            console.log(`[register] User already exists with email: ${email} or username: ${username}`);
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Create new user
        console.log(`[register] Creating new user: ${username}, ${email}`);
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate token
        console.log(`[register] Generating token for new user: ${user._id}`);
        const token = generateToken(user._id);

        console.log(`[register] User registered successfully: ${user._id}`);
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('[register] Error registering user:', {
            email: req.body?.email,
            username: req.body?.username,
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });

        // Handle MongoDB duplicate key errors more gracefully
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email or username already exists',
                error: 'Duplicate field value'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// Login User
export const login = async (req, res) => {
    console.log('[login] Processing login request');
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            console.error('[login] Missing required fields:', {
                hasEmail: !!email,
                hasPassword: !!password
            });
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        console.log(`[login] Finding user by email: ${email}`);
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`[login] User not found with email: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        console.log(`[login] Verifying password for user: ${user._id}`);
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            console.log(`[login] Password verification failed for user: ${user._id}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        console.log(`[login] Generating token for user: ${user._id}`);
        const token = generateToken(user._id);

        console.log(`[login] User logged in successfully: ${user._id}`);
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('[login] Error logging in user:', {
            email: req.body?.email,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Logout User
export const logout = async (req, res) => {
    console.log('[logout] Processing logout request');
    try {
        console.log('[logout] User logged out successfully');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('[logout] Error logging out user:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};
