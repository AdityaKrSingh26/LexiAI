const express = require('express');
const multer = require('multer');
const pdfService = require('../services/pdfService');
const chatService = require('../services/chatService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload PDF and create a new entry
router.post('/upload', authenticate, upload.single('pdf'), async (req, res) => {
    try {
        const userId = req.user.id;
        const pdfData = await pdfService.uploadPDF(req.file, userId);
        res.status(201).json(pdfData);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading PDF', error: error.message });
    }
});

// Summarize PDF content
router.post('/:pdfId/summarize', authenticate, async (req, res) => {
    try {
        const { pdfId } = req.params;
        const summary = await pdfService.summarizePDF(pdfId);
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error summarizing PDF', error: error.message });
    }
});

// Interact with the Gemini AI model
router.post('/:pdfId/chat', authenticate, async (req, res) => {
    try {
        const { pdfId } = req.params;
        const { question } = req.body;
        const response = await chatService.askQuestion(pdfId, question);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error interacting with AI', error: error.message });
    }
});

// Get chat history for a specific PDF
router.get('/:pdfId/chats', authenticate, async (req, res) => {
    try {
        const { pdfId } = req.params;
        const chats = await chatService.getChatHistory(pdfId);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving chat history', error: error.message });
    }
});

module.exports = router;