import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/chat.model.js';
import PDF from '../models/pdf.model.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Get all chats for a PDF
export const getPDFChats = async (req, res) => {
    console.log(`[getPDFChats] Fetching chats for PDF: ${req.params.pdfId}`);
    try {
        if (!req.params.pdfId) {
            console.error("[getPDFChats] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        const userId = req.query.userId; // Changed from req.body to req.query
        if (!userId) {
            console.error("[getPDFChats] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[getPDFChats] Verifying PDF ownership for user: ${userId}`);
        const pdf = await PDF.findOne({
            _id: req.params.pdfId,
            user: userId
        });

        if (!pdf) {
            console.error(`[getPDFChats] PDF not found with ID: ${req.params.pdfId} for user: ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        console.log(`[getPDFChats] Querying chats for PDF: ${pdf._id}`);
        const chats = await Chat.find({ pdfId: pdf._id })
            .sort('createdAt')
            .select('question response createdAt');

        console.log(`[getPDFChats] Successfully retrieved ${chats.length} chats for PDF: ${pdf._id}`);
        res.status(200).json({
            success: true,
            count: chats.length,
            data: chats
        });
    } catch (error) {
        console.error("[getPDFChats] Error fetching chats:", error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chats',
            error: error.message
        });
    }
};

// Delete chat
export const deleteChat = async (req, res) => {
    console.log(`[deleteChat] Attempting to delete chat: ${req.params.chatId}`);
    try {
        if (!req.params.chatId) {
            console.error("[deleteChat] No chat ID provided");
            return res.status(400).json({
                success: false,
                message: 'Chat ID is required'
            });
        }

        if (!req.user?._id) {
            console.error("[deleteChat] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[deleteChat] Finding chat with ID: ${req.params.chatId}`);
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            console.error(`[deleteChat] Chat not found with ID: ${req.params.chatId}`);
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Verify user owns the PDF associated with the chat
        console.log(`[deleteChat] Verifying PDF ownership for chat: ${chat._id}`);
        const pdf = await PDF.findOne({
            _id: chat.pdfId,
            user: req.user._id
        });

        if (!pdf) {
            console.error(`[deleteChat] User ${req.user._id} not authorized to delete chat ${chat._id}`);
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this chat'
            });
        }

        console.log(`[deleteChat] Deleting chat: ${chat._id}`);
        await chat.deleteOne();

        // Remove chat from PDF's chats array
        console.log(`[deleteChat] Removing chat reference from PDF: ${pdf._id}`);
        pdf.chats = pdf.chats.filter(id => id.toString() !== chat._id.toString());
        await pdf.save();

        console.log(`[deleteChat] Successfully deleted chat: ${chat._id}`);
        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        console.error("[deleteChat] Error deleting chat:", {
            chatId: req.params.chatId,
            userId: req.user?._id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Error deleting chat',
            error: error.message
        });
    }
};