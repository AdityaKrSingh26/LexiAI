const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const authMiddleware = require('../middleware/auth');

// Route to upload a PDF
router.post('/upload', authMiddleware.authenticate, pdfController.uploadPDF);

// Route to summarize a PDF
router.post('/summarize/:pdfId', authMiddleware.authenticate, pdfController.summarizePDF);

// Route to interact with the Gemini AI model
router.post('/interact/:pdfId', authMiddleware.authenticate, pdfController.interactWithAI);

// Route to get all PDFs for a user
router.get('/', authMiddleware.authenticate, pdfController.getUserPDFs);

// Route to get a specific PDF by ID
router.get('/:pdfId', authMiddleware.authenticate, pdfController.getPDFById);

module.exports = router;