import mongoose from "mongoose";

const PDFSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true
        },
        title: {
            type: String,
            required: [true, "Document title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"]
        },
        originalFilename: {
            type: String,
            trim: true
        },
        url: {
            type: String,
            required: [true, "Cloudinary URL is required"]
        },
        textContent: {
            type: String,
            select: false
        },
        chunks: [{
            chunkId: Number,
            text: String,
            startIndex: Number,
            endIndex: Number,
            length: Number,
            wordCount: Number,
            hasNumbers: Boolean,
            hasFormulas: Boolean,
            sentences: Number,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        chunkingEnabled: {
            type: Boolean,
            default: true
        },
        summary: {
            type: String,
            default: ''
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        notes: {
            type: String,
            default: '',
            trim: true
        },
        chats: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }],
        // New fields for document management
        collections: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection"
        }],
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        version: {
            type: Number,
            default: 1
        },
        parentDocument: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PDF",
            default: null
        },
        versions: [{
            version: Number,
            url: String,
            uploadedAt: Date,
            notes: String,
            fileSize: Number
        }],
        fileSize: {
            type: Number,
            default: 0
        },
        mimeType: {
            type: String,
            default: 'application/pdf'
        },
        status: {
            type: String,
            enum: ['processing', 'ready', 'error'],
            default: 'processing'
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
        lastAccessedAt: {
            type: Date,
            default: Date.now
        },
        accessCount: {
            type: Number,
            default: 0
        },
        isFavorite: {
            type: Boolean,
            default: false
        },
        metadata: {
            author: String,
            subject: String,
            keywords: [String],
            pageCount: Number,
            language: String,
            extractedEntities: [{
                text: String,
                type: String, // person, organization, location, etc.
                confidence: Number
            }]
        }
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient searching
PDFSchema.index({ user: 1, title: 1 });
PDFSchema.index({ tags: 1 });
PDFSchema.index({ 'sharedWith.user': 1 });
PDFSchema.index({ status: 1 });
PDFSchema.index({ collections: 1 });
PDFSchema.index({ parentDocument: 1 });

// Virtual for chat count
PDFSchema.virtual('chatCount').get(function () {
    return this.chats?.length || 0;
});

// Virtual for latest version
PDFSchema.virtual('isLatestVersion').get(function () {
    return !this.parentDocument;
});

// Method to add a chat to the PDF
PDFSchema.methods.addChat = function (chatId) {
    this.chats.push(chatId);
    return this.save();
};

// Method to check if user has permission
PDFSchema.methods.hasPermission = function (userId, requiredPermission = 'read') {
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

// Method to add to collection
PDFSchema.methods.addToCollection = function (collectionId) {
    if (!this.collections.includes(collectionId)) {
        this.collections.push(collectionId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to track access
PDFSchema.methods.trackAccess = function () {
    this.lastAccessedAt = new Date();
    this.accessCount += 1;
    return this.save();
};

// Method to create new version
PDFSchema.methods.createNewVersion = function (newData) {
    // Add current version to history
    this.versions.push({
        version: this.version,
        url: this.url,
        uploadedAt: this.uploadedAt,
        notes: this.notes,
        fileSize: this.fileSize
    });
    
    // Update with new version data
    this.version += 1;
    this.url = newData.url;
    this.uploadedAt = new Date();
    this.fileSize = newData.fileSize;
    if (newData.notes) this.notes = newData.notes;
    
    return this.save();
};

// Static method to get user's accessible documents
PDFSchema.statics.getAccessibleDocuments = function (userId) {
    return this.find({
        $or: [
            { user: userId },
            { 'sharedWith.user': userId },
            { isPublic: true }
        ]
    }).populate('collections user');
};

const PDF = mongoose.model("PDF", PDFSchema);

export default PDF;