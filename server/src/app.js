import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { generalLimiter } from './middleware/rateLimiting.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration - Allow all origins
const corsOptions = {
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(generalLimiter); // Apply rate limiting
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import controllers
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import collectionRoutes from './routes/collection.routes.js';

import errorHandler from './middleware/errorHandler.js';


// Health check route
app.get('/api/health', (req, res) => {
    console.log('Health check')
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/collections', collectionRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;