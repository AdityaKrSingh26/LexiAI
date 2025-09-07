import Collection from '../models/collection.model.js';
import PDF from '../models/pdf.model.js';
import User from '../models/user.model.js';

// Create a new collection
export const createCollection = async (req, res) => {
    console.log('[createCollection] Creating new collection');
    try {
        const { name, description, parent, color, icon, tags } = req.body;
        const userId = req.user._id;

        // Check if parent collection exists and user has access
        if (parent) {
            const parentCollection = await Collection.findById(parent);
            if (!parentCollection || !parentCollection.hasPermission(userId, 'write')) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot create collection in this location'
                });
            }
        }

        const collection = await Collection.create({
            name,
            description,
            user: userId,
            parent: parent || null,
            color: color || '#3B82F6',
            icon: icon || 'Folder',
            tags: tags || []
        });

        // If has parent, add to parent's children
        if (parent) {
            await Collection.findByIdAndUpdate(parent, {
                $push: { children: collection._id }
            });
        }

        const populatedCollection = await Collection.findById(collection._id)
            .populate('documents')
            .populate('children');

        console.log(`[createCollection] Collection created successfully: ${collection._id}`);
        res.status(201).json({
            success: true,
            data: populatedCollection
        });
    } catch (error) {
        console.error('[createCollection] Error creating collection:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating collection',
            error: error.message
        });
    }
};

// Get user's collections
export const getUserCollections = async (req, res) => {
    console.log('[getUserCollections] Fetching user collections');
    try {
        const userId = req.user._id;
        const { includeShared = true } = req.query;

        let query = { user: userId };
        
        if (includeShared === 'true') {
            query = {
                $or: [
                    { user: userId },
                    { 'sharedWith.user': userId },
                    { isPublic: true }
                ]
            };
        }

        const collections = await Collection.find(query)
            .populate('documents', 'title uploadedAt fileSize status')
            .populate('children')
            .populate('user', 'username email')
            .sort({ createdAt: -1 });

        console.log(`[getUserCollections] Found ${collections.length} collections`);
        res.status(200).json({
            success: true,
            count: collections.length,
            data: collections
        });
    } catch (error) {
        console.error('[getUserCollections] Error fetching collections:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching collections',
            error: error.message
        });
    }
};

// Get collection by ID
export const getCollectionById = async (req, res) => {
    console.log(`[getCollectionById] Fetching collection: ${req.params.id}`);
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const collection = await Collection.findById(id)
            .populate('documents', 'title uploadedAt fileSize status tags isFavorite')
            .populate('children')
            .populate('user', 'username email')
            .populate('sharedWith.user', 'username email');

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        if (!collection.hasPermission(userId, 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        console.log(`[getCollectionById] Collection retrieved: ${collection._id}`);
        res.status(200).json({
            success: true,
            data: collection
        });
    } catch (error) {
        console.error('[getCollectionById] Error fetching collection:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching collection',
            error: error.message
        });
    }
};

// Update collection
export const updateCollection = async (req, res) => {
    console.log(`[updateCollection] Updating collection: ${req.params.id}`);
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        const collection = await Collection.findById(id);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        if (!collection.hasPermission(userId, 'write')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['name', 'description', 'color', 'icon', 'tags', 'isPublic'];
        const updateData = {};
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        });

        const updatedCollection = await Collection.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('documents').populate('children');

        console.log(`[updateCollection] Collection updated: ${collection._id}`);
        res.status(200).json({
            success: true,
            data: updatedCollection
        });
    } catch (error) {
        console.error('[updateCollection] Error updating collection:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating collection',
            error: error.message
        });
    }
};

// Delete collection
export const deleteCollection = async (req, res) => {
    console.log(`[deleteCollection] Deleting collection: ${req.params.id}`);
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const collection = await Collection.findById(id);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        if (!collection.hasPermission(userId, 'admin') && !collection.user.equals(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        // Move children to parent or root
        if (collection.children.length > 0) {
            await Collection.updateMany(
                { _id: { $in: collection.children } },
                { parent: collection.parent }
            );
        }

        // Remove from parent's children array
        if (collection.parent) {
            await Collection.findByIdAndUpdate(collection.parent, {
                $pull: { children: collection._id }
            });
        }

        // Remove collection reference from documents
        await PDF.updateMany(
            { collections: collection._id },
            { $pull: { collections: collection._id } }
        );

        await Collection.findByIdAndDelete(id);

        console.log(`[deleteCollection] Collection deleted: ${collection._id}`);
        res.status(200).json({
            success: true,
            message: 'Collection deleted successfully'
        });
    } catch (error) {
        console.error('[deleteCollection] Error deleting collection:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting collection',
            error: error.message
        });
    }
};

// Add documents to collection
export const addDocumentsToCollection = async (req, res) => {
    console.log(`[addDocumentsToCollection] Adding documents to collection: ${req.params.id}`);
    try {
        const { id } = req.params;
        const { documentIds } = req.body;
        const userId = req.user._id;

        const collection = await Collection.findById(id);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        if (!collection.hasPermission(userId, 'write')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        // Verify user has access to all documents
        const documents = await PDF.find({
            _id: { $in: documentIds },
            $or: [
                { user: userId },
                { 'sharedWith.user': userId }
            ]
        });

        if (documents.length !== documentIds.length) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to some documents'
            });
        }

        // Add documents to collection
        const validDocumentIds = documents.map(doc => doc._id);
        await Collection.findByIdAndUpdate(id, {
            $addToSet: { documents: { $each: validDocumentIds } }
        });

        // Add collection reference to documents
        await PDF.updateMany(
            { _id: { $in: validDocumentIds } },
            { $addToSet: { collections: id } }
        );

        const updatedCollection = await Collection.findById(id)
            .populate('documents');

        console.log(`[addDocumentsToCollection] Added ${documents.length} documents to collection`);
        res.status(200).json({
            success: true,
            data: updatedCollection,
            message: `Added ${documents.length} documents to collection`
        });
    } catch (error) {
        console.error('[addDocumentsToCollection] Error adding documents:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding documents to collection',
            error: error.message
        });
    }
};

// Remove documents from collection
export const removeDocumentsFromCollection = async (req, res) => {
    console.log(`[removeDocumentsFromCollection] Removing documents from collection: ${req.params.id}`);
    try {
        const { id } = req.params;
        const { documentIds } = req.body;
        const userId = req.user._id;

        const collection = await Collection.findById(id);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        if (!collection.hasPermission(userId, 'write')) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        // Remove documents from collection
        await Collection.findByIdAndUpdate(id, {
            $pull: { documents: { $in: documentIds } }
        });

        // Remove collection reference from documents
        await PDF.updateMany(
            { _id: { $in: documentIds } },
            { $pull: { collections: id } }
        );

        const updatedCollection = await Collection.findById(id)
            .populate('documents');

        console.log(`[removeDocumentsFromCollection] Removed ${documentIds.length} documents from collection`);
        res.status(200).json({
            success: true,
            data: updatedCollection,
            message: `Removed ${documentIds.length} documents from collection`
        });
    } catch (error) {
        console.error('[removeDocumentsFromCollection] Error removing documents:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing documents from collection',
            error: error.message
        });
    }
};

// Share collection
export const shareCollection = async (req, res) => {
    console.log(`[shareCollection] Sharing collection: ${req.params.id}`);
    try {
        const { id } = req.params;
        const { email, permission = 'read' } = req.body;
        const userId = req.user._id;

        const collection = await Collection.findById(id);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        if (!collection.hasPermission(userId, 'admin') && !collection.user.equals(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const targetUser = await User.findOne({ email });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already shared
        const existingShare = collection.sharedWith.find(share => 
            share.user.equals(targetUser._id)
        );

        if (existingShare) {
            existingShare.permission = permission;
        } else {
            collection.sharedWith.push({
                user: targetUser._id,
                permission,
                sharedAt: new Date()
            });
        }

        await collection.save();

        console.log(`[shareCollection] Collection shared with ${email}`);
        res.status(200).json({
            success: true,
            message: `Collection shared with ${email}`,
            data: collection
        });
    } catch (error) {
        console.error('[shareCollection] Error sharing collection:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing collection',
            error: error.message
        });
    }
};
