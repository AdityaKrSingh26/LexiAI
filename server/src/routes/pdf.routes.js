import express from 'express';
import { uploadPDF } from '../config/cloudinary.js';
import {
    uploadPDF as uploadPDFController,
    getPDFById,
    deletePDF,
    summarizePDF,
    askQuestion,
    generatePDFFlow,
    getUserPDFs,
    updateNotes,
    getNotes
} from '../controllers/pdf.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
// router.use(authMiddleware);

router.post('/upload', uploadPDF, uploadPDFController);
router.get('/:id', getPDFById);
router.get('/:userId/pdfs', getUserPDFs);
router.delete('/:id', deletePDF);
router.post('/:id/summarize', summarizePDF);
router.post('/:id/ask', askQuestion);
router.get('/:id/flow', generatePDFFlow);
// notes route
router.put('/:id/notes', updateNotes);
router.get('/:id/notes', getNotes);

export default router;