import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import PDF from '../models/pdf.model.js';

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

// Get Current User Profile
export const getProfile = async (req, res) => {
    console.log('[getProfile] Fetching user profile');
    try {
        if (!req.user?._id) {
            console.error('[getProfile] No authenticated user found');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        console.log(`[getProfile] Fetching profile for user: ${req.user._id}`);
        const user = await User.findById(req.user._id);

        if (!user) {
            console.error(`[getProfile] User not found with ID: ${req.user._id}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Count user PDFs
        console.log(`[getProfile] Counting PDFs for user: ${user._id}`);
        const pdfCount = await PDF.countDocuments({ user: user._id });

        console.log(`[getProfile] Profile retrieved successfully for: ${user._id}`);
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                pdfCount
            }
        });
    } catch (error) {
        console.error('[getProfile] Error fetching user profile:', {
            userId: req.user?._id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

// Update User Profile
export const updateProfile = async (req, res) => {
    console.log('[updateProfile] Processing profile update request');
    try {
        const { username, email, currentPassword, newPassword } = req.body;

        if (!req.user?._id) {
            console.error('[updateProfile] No authenticated user found');
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        console.log(`[updateProfile] Finding user to update: ${req.user._id}`);
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            console.error(`[updateProfile] User not found with ID: ${req.user._id}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields if provided
        let isModified = false;

        if (username && username !== user.username) {
            console.log(`[updateProfile] Updating username from ${user.username} to ${username}`);

            // Check if username is already taken
            const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
            if (usernameExists) {
                console.error(`[updateProfile] Username already taken: ${username}`);
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }

            user.username = username;
            isModified = true;
        }

        if (email && email !== user.email) {
            console.log(`[updateProfile] Updating email from ${user.email} to ${email}`);

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.error(`[updateProfile] Invalid email format: ${email}`);
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

            // Check if email is already taken
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                console.error(`[updateProfile] Email already taken: ${email}`);
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }

            user.email = email;
            isModified = true;
        }

        // Handle password change if requested
        if (newPassword && currentPassword) {
            console.log(`[updateProfile] Password change requested for user: ${user._id}`);

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                console.error(`[updateProfile] Current password verification failed for user: ${user._id}`);
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Password strength check
            if (newPassword.length < 6) {
                console.error(`[updateProfile] New password too short`);
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            user.password = newPassword;
            isModified = true;
            console.log(`[updateProfile] Password updated for user: ${user._id}`);
        }

        if (!isModified) {
            console.log(`[updateProfile] No changes to update for user: ${user._id}`);
            return res.status(400).json({
                success: false,
                message: 'No changes to update'
            });
        }

        // Save the updated user
        console.log(`[updateProfile] Saving updated profile for user: ${user._id}`);
        await user.save();

        console.log(`[updateProfile] Profile updated successfully for user: ${user._id}`);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('[updateProfile] Error updating profile:', {
            userId: req.user?._id,
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`,
                error: 'Duplicate field value'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};