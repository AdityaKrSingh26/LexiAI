import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors())
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// import controllers
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';

import errorHandler from './middleware/errorHandler.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/pdfs', pdfRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;