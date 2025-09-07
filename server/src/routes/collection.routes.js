import express from 'express';
import {
    createCollection,
    getUserCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    addDocumentsToCollection,
    removeDocumentsFromCollection,
    shareCollection
} from '../controllers/collection.controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Collection CRUD
router.post('/', createCollection);
router.get('/', getUserCollections);
router.get('/:id', getCollectionById);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Document management
router.post('/:id/documents', addDocumentsToCollection);
router.delete('/:id/documents', removeDocumentsFromCollection);

// Sharing
router.post('/:id/share', shareCollection);

export default router;
