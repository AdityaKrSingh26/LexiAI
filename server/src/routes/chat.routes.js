import express from 'express';
import {
    getPDFChats,
    deleteChat
} from '../controllers/chat.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
// router.use(authMiddleware);

router.get('/:pdfId/chats', getPDFChats);
router.delete('/chats/:chatId', deleteChat);

export default router;