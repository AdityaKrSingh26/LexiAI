import { uploadPDFToCloudinary } from '../config/cloudinary.js';
import PDF from '../models/pdf.model.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Upload PDF
export const uploadPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const result = await uploadPDFToCloudinary(req.file);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        const pdf = await PDF.create({
            user: req.body.userId,
            title: req.body.title || req.file.originalname,
            originalFilename: req.file.originalname,
            url: result.url,
            textContent: req.body.textContent || ''
        });

        res.status(201).json({
            success: true,
            data: pdf
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all PDFs for a user
export const getAllPDFs = async (req, res) => {
    try {
        const userId = req.body.userId || req.user._id;

        const pdfs = await PDF.find({ user: userId })
            .select('-textContent')
            .sort('-uploadedAt');

        res.status(200).json({
            success: true,
            count: pdfs.length,
            data: pdfs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get PDF by ID
export const getPDFById = async (req, res) => {
    try {
        const userId = req.body.userId || req.user._id;

        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: userId
        }).populate('chats');

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        res.status(200).json({
            success: true,
            data: pdf
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserPDFs = async (req, res) => {
    try {
        const userId = req.body.userId || req.params.userId || req.user._id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get PDFs with populated chat counts
        const pdfs = await PDF.find({ user: userId })
            .select('-textContent')
            .populate({
                path: 'chats',
                select: 'question response createdAt'
            })
            .sort('-uploadedAt');

        res.status(200).json({
            success: true,
            count: pdfs.length,
            data: pdfs.map(pdf => ({
                ...pdf.toObject(),
                chatCount: pdf.chats.length
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user PDFs',
            error: error.message
        });
    }
};

// Delete PDF
export const deletePDF = async (req, res) => {
    try {
        const pdf = await PDF.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        // Delete associated chats
        await Chat.deleteMany({ pdfId: pdf._id });

        res.status(200).json({
            success: true,
            message: 'PDF deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Summarize PDF
export const summarizePDF = async (req, res) => {
    try {
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('+textContent');

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        const prompt = `Please provide a comprehensive summary of the following text: ${pdf.textContent}`;
        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        pdf.summary = summary;
        await pdf.save();

        res.status(200).json({
            success: true,
            data: {
                summary: pdf.summary
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Ask question about PDF
export const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('+textContent');

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        const prompt = `Based on the following text: "${pdf.textContent}", please answer this question: ${question}`;
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
            message: error.message
        });
    }
};

// Generate PDF flow
export const generatePDFFlow = async (req, res) => {
    try {
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('+textContent');

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        const prompt = `Generate a structured flow or outline of the main concepts and their relationships from the following text: ${pdf.textContent}`;
        const result = await model.generateContent(prompt);
        const flow = result.response.text();

        res.status(200).json({
            success: true,
            data: {
                flow
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};