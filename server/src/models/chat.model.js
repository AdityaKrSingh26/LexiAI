import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    pdfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PDF',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: [true, 'Question is required']
    },
    response: {
        type: String,
        required: [true, 'Response is required']
    },
    metadata: {
        searchMethod: {
            type: String,
            enum: ['semantic_search', 'full_content', 'keyword_search'],
            default: 'full_content'
        },
        chunksUsed: {
            type: Number,
            default: 1
        },
        totalChunks: {
            type: Number,
            default: 1
        },
        contextLength: {
            type: Number,
            default: 0
        },
        averageRelevanceScore: {
            type: Number,
            default: 0
        },
        processingTime: {
            type: Number, // in milliseconds
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
chatSchema.index({ pdfId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;