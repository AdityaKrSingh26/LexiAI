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

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Document CRUD
router.post('/upload', uploadPDF, uploadPDFController);
router.get('/search', searchDocuments);
router.get('/analytics', getUserAnalytics);
router.post('/update-file-sizes', updateFileSizes);
router.post('/rechunk', rechunkPDFs);
router.get('/user/:userId/pdfs', getUserPDFs);  // Make this more specific
router.get('/:id/chunks', getChunkingStats);
router.get('/:id', getPDFById);
router.delete('/:id', deletePDF);

// Document operations
router.post('/:id/summarize', summarizePDF);
router.post('/:id/ask', askQuestion);
router.get('/:id/flow', generatePDFFlow);
router.post('/:id/share', shareDocument);
router.get('/:id/versions', getDocumentVersions);
router.post('/:id/favorite', toggleFavorite);

// Notes
router.put('/:id/notes', updateNotes);
router.get('/:id/notes', getNotes);

// Bulk operations
router.post('/bulk', bulkOperations);

export default router;