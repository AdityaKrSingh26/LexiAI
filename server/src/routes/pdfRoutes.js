import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    upload,
    uploadPDF,
    getUserPDFs,
    getPDFById,
    deletePDF,
    summarizePDF,
    interactWithAI,
    generateFlowchart
} from '../controllers/pdfController.js';

const router = express.Router();

// Route to upload a PDF
router.post('/upload', authenticate, upload.single('pdf'), uploadPDF);

// Route to get all PDFs for a user
router.get('/', authenticate, getUserPDFs);

// Route to get a specific PDF by ID
router.get('/:pdfId', authenticate, getPDFById);

// Route to delete a PDF
router.delete('/:pdfId', authenticate, deletePDF);

// Route to summarize a PDF
router.post('/summarize/:pdfId', authenticate, summarizePDF);

// Route to interact with the Gemini AI model
router.post('/interact/:pdfId', authenticate, interactWithAI);

// Route to generate flowchart from PDF
router.post('/flowchart/:pdfId', authenticate, generateFlowchart);

export default router;