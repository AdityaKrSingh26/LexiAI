import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/chat.model.js';
import PDF from '../models/pdf.model.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Get conversation history
const getPreviousContext = async (pdfId, limit = 2) => {
    const previousChats = await Chat.find({ pdfId })
        .sort({ createdAt: -1 })
        .limit(limit);

    return previousChats.reverse().map(chat =>
        `Question: ${chat.question}\nAnswer: ${chat.response}`
    ).join('\n\n');
};

// Ask question with context
export const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        const pdfId = req.params.pdfId;

        // Get PDF with text content
        const pdf = await PDF.findOne({
            _id: pdfId,
            user: req.user._id
        }).select('+textContent');

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        // Get previous context
        const previousContext = await getPreviousContext(pdfId);

        // Construct prompt with context
        const prompt = `Context from PDF: "${pdf.textContent}"
        Previous conversation:
        ${previousContext}

        Current question: ${question}

        Please provide a detailed answer to the current question based on the PDF content and previous conversation context.`;

        // Generate response
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Save chat
        const chat = await Chat.create({
            pdfId: pdf._id,
            userId: req.user._id,
            question,
            response
        });

        // Add chat to PDF
        await pdf.addChat(chat._id);

        res.status(200).json({
            success: true,
            data: chat
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing question',
            error: error.message
        });
    }
};

// Get all chats for a PDF
export const getPDFChats = async (req, res) => {
    try {
        const pdf = await PDF.findOne({
            _id: req.params.pdfId,
            user: req.user._id
        });

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        const chats = await Chat.find({ pdfId: pdf._id })
            .sort('createdAt')
            .select('question response createdAt');

        res.status(200).json({
            success: true,
            count: chats.length,
            data: chats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching chats',
            error: error.message
        });
    }
};

// Delete chat
export const deleteChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Verify user owns the PDF associated with the chat
        const pdf = await PDF.findOne({
            _id: chat.pdfId,
            user: req.user._id
        });

        if (!pdf) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this chat'
            });
        }

        await chat.deleteOne();

        // Remove chat from PDF's chats array
        pdf.chats = pdf.chats.filter(id => id.toString() !== chat._id.toString());
        await pdf.save();

        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting chat',
            error: error.message
        });
    }
};