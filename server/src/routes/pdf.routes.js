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
    getNotes,
    searchDocuments,
    bulkOperations,
    shareDocument,
    getDocumentVersions,
    toggleFavorite,
    getUserAnalytics,
    updateFileSizes,
    rechunkPDFs,
    getChunkingStats
} from '../controllers/pdf.controller.js';
import authMiddleware from '../middleware/auth.js';
import { validateQuestion } from '../middleware/validation.js';

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// ── Static / non-parameterised routes first (MUST come before /:id routes) ──
router.post('/upload', uploadPDF, uploadPDFController);
router.get('/search', searchDocuments);
router.get('/analytics', getUserAnalytics);
router.post('/update-file-sizes', updateFileSizes);
router.post('/rechunk', rechunkPDFs);
router.post('/bulk', bulkOperations);                      // ← fixed: was below /:id routes
router.get('/me', getUserPDFs);

// ── Parameterised routes ──
router.get('/:id/chunks', getChunkingStats);
router.get('/:id', getPDFById);
router.delete('/:id', deletePDF);

// Document operations
router.post('/:id/summarize', summarizePDF);
router.post('/:id/ask', validateQuestion, askQuestion);
router.get('/:id/flow', generatePDFFlow);
router.post('/:id/share', shareDocument);
router.get('/:id/versions', getDocumentVersions);
router.post('/:id/favorite', toggleFavorite);

// Notes
router.put('/:id/notes', updateNotes);
router.get('/:id/notes', getNotes);

export default router;