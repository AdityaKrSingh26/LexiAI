import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Collection name is required"],
            trim: true,
            maxlength: [100, "Collection name cannot exceed 100 characters"]
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"]
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true
        },
        documents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "PDF"
        }],
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection",
            default: null
        },
        children: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection"
        }],
        color: {
            type: String,
            default: '#3B82F6',
            match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
        },
        icon: {
            type: String,
            default: 'Folder'
        },
        isPublic: {
            type: Boolean,
            default: false
        },
        sharedWith: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            permission: {
                type: String,
                enum: ['read', 'write', 'admin'],
                default: 'read'
            },
            sharedAt: {
                type: Date,
                default: Date.now
            }
        }],
        tags: [{
            type: String,
            trim: true
        }]
    },
    {
        timestamps: true,
    }
);

// Index for efficient searching
CollectionSchema.index({ user: 1, name: 1 });
CollectionSchema.index({ tags: 1 });
CollectionSchema.index({ 'sharedWith.user': 1 });

// Virtual for document count
CollectionSchema.virtual('documentCount').get(function () {
    return this.documents?.length || 0;
});

// Virtual for nested structure
CollectionSchema.virtual('isRootCollection').get(function () {
    return !this.parent;
});

// Method to add document to collection
CollectionSchema.methods.addDocument = function (documentId) {
    if (!this.documents.includes(documentId)) {
        this.documents.push(documentId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove document from collection
CollectionSchema.methods.removeDocument = function (documentId) {
    this.documents = this.documents.filter(id => !id.equals(documentId));
    return this.save();
};

// Method to check if user has permission
CollectionSchema.methods.hasPermission = function (userId, requiredPermission = 'read') {
    // Owner has all permissions
    if (this.user.equals(userId)) {
        return true;
    }
    
    // Check shared permissions
    const userPermission = this.sharedWith.find(share => share.user.equals(userId));
    if (!userPermission) {
        return this.isPublic && requiredPermission === 'read';
    }
    
    const permissionLevels = { read: 0, write: 1, admin: 2 };
    return permissionLevels[userPermission.permission] >= permissionLevels[requiredPermission];
};

// Static method to get user's accessible collections
CollectionSchema.statics.getAccessibleCollections = function (userId) {
    return this.find({
        $or: [
            { user: userId },
            { 'sharedWith.user': userId },
            { isPublic: true }
        ]
    }).populate('documents user');
};

const Collection = mongoose.model("Collection", CollectionSchema);

export default Collection;
