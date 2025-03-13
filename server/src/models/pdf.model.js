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
        summary: {
            type: String,
            default: ''
        },
        uploadedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        chats: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }],
    },
    {
        timestamps: true,
    }
);


// Virtual for chat count
PDFSchema.virtual('chatCount').get(function () {
    return this.chats?.length || 0;
});

// Method to add a chat to the PDF
PDFSchema.methods.addChat = function (chatId) {
    this.chats.push(chatId);
    return this.save();
};

const PDF = mongoose.model("PDF", PDFSchema);

export default PDF;