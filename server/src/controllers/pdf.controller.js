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
    console.log("[uploadPDF] Starting PDF upload process");
    try {
        // Check if file exists in request
        if (!req.file) {
            console.error("[uploadPDF] Error: No file provided in request");
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Cloudinary
        console.log("[uploadPDF] Uploading file to Cloudinary:", req.file.originalname);
        const result = await uploadPDFToCloudinary(req.file);
        console.log("[uploadPDF] Cloudinary upload result:", result);

        if (!result.success) {
            console.error("[uploadPDF] Cloudinary upload failed:", result.error);
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        // Create PDF document
        console.log("[uploadPDF] Creating PDF document in database");
        const pdf = await PDF.create({
            user: req.body.userId,
            title: req.body.title || req.file.originalname,
            originalFilename: req.file.originalname,
            url: result.url,
            textContent: req.body.textContent || ''
        });

        console.log("[uploadPDF] PDF document created successfully:", {
            id: pdf._id,
            title: pdf.title,
            user: pdf.user
        });

        res.status(201).json({
            success: true,
            data: pdf
        });
    } catch (error) {
        console.error("[uploadPDF] Unexpected error:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to upload PDF',
            error: error.message
        });
    }
};

// Get all PDFs for a user
export const getAllPDFs = async (req, res) => {
    console.log("[getAllPDFs] Fetching all PDFs for user");
    try {
        const userId = req.body.userId || req.user?._id;

        if (!userId) {
            console.error("[getAllPDFs] No user ID provided");
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        console.log("[getAllPDFs] Querying PDFs for user:", userId);
        const pdfs = await PDF.find({ user: userId })
            .select('-textContent')
            .sort('-uploadedAt');

        console.log(`[getAllPDFs] Retrieved ${pdfs.length} PDFs for user ${userId}`);
        res.status(200).json({
            success: true,
            count: pdfs.length,
            data: pdfs
        });
    } catch (error) {
        console.error("[getAllPDFs] Error fetching PDFs:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve PDFs',
            error: error.message
        });
    }
};

// Get PDF by ID
export const getPDFById = async (req, res) => {
    console.log("[getPDFById] Fetching PDF by ID:", req.params.id);
    try {
        if (!req.params.id) {
            console.error("[getPDFById] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        const userId = req.body.userId || req.user?._id;
        if (!userId) {
            console.error("[getPDFById] No user ID provided");
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        console.log(`[getPDFById] Querying PDF with ID ${req.params.id} for user ${userId}`);
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: userId
        }).populate('chats');

        if (!pdf) {
            console.error(`[getPDFById] PDF not found with ID ${req.params.id} for user ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        console.log(`[getPDFById] Successfully retrieved PDF: ${pdf._id}`);
        res.status(200).json({
            success: true,
            data: pdf
        });
    } catch (error) {
        console.error("[getPDFById] Error fetching PDF:", {
            id: req.params.id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve PDF',
            error: error.message
        });
    }
};

export const getUserPDFs = async (req, res) => {
    console.log("[getUserPDFs] Fetching PDFs with chat counts");
    try {
        const userId = req.body.userId || req.params.userId || req.user?._id;

        if (!userId) {
            console.error("[getUserPDFs] No user ID provided");
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Check if user exists
        console.log(`[getUserPDFs] Verifying user exists: ${userId}`);
        const user = await User.findById(userId);
        if (!user) {
            console.error(`[getUserPDFs] User not found with ID: ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get PDFs with populated chat counts
        console.log(`[getUserPDFs] Querying PDFs with chats for user: ${userId}`);
        const pdfs = await PDF.find({ user: userId })
            .select('-textContent')
            .populate({
                path: 'chats',
                select: 'question response createdAt'
            })
            .sort('-uploadedAt');

        console.log(`[getUserPDFs] Found ${pdfs.length} PDFs for user ${userId}`);
        res.status(200).json({
            success: true,
            count: pdfs.length,
            data: pdfs.map(pdf => ({
                ...pdf.toObject(),
                chatCount: pdf.chats.length
            }))
        });
    } catch (error) {
        console.error("[getUserPDFs] Error fetching user PDFs:", {
            userId: req.body.userId || req.params.userId || req.user?._id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Error fetching user PDFs',
            error: error.message
        });
    }
};

// Delete PDF
export const deletePDF = async (req, res) => {
    console.log("[deletePDF] Attempting to delete PDF:", req.params.id);
    try {
        if (!req.params.id) {
            console.error("[deletePDF] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        if (!req.user?._id) {
            console.error("[deletePDF] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[deletePDF] Finding PDF with ID ${req.params.id} for user ${req.user._id}`);
        const pdf = await PDF.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!pdf) {
            console.error(`[deletePDF] PDF not found with ID ${req.params.id} for user ${req.user._id}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        // Delete associated chats
        console.log(`[deletePDF] Deleting associated chats for PDF: ${pdf._id}`);
        const deleteResult = await Chat.deleteMany({ pdfId: pdf._id });
        console.log(`[deletePDF] Deleted ${deleteResult.deletedCount} chats associated with PDF ${pdf._id}`);

        console.log(`[deletePDF] Successfully deleted PDF: ${pdf._id}`);
        res.status(200).json({
            success: true,
            message: 'PDF deleted successfully'
        });
    } catch (error) {
        console.error("[deletePDF] Error deleting PDF:", {
            id: req.params.id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to delete PDF',
            error: error.message
        });
    }
};

// Summarize PDF
export const summarizePDF = async (req, res) => {
    console.log("[summarizePDF] Generating summary for PDF:", req.params.id);
    try {
        if (!req.params.id) {
            console.error("[summarizePDF] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        if (!req.user?._id) {
            console.error("[summarizePDF] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[summarizePDF] Finding PDF with ID ${req.params.id} for user ${req.user._id}`);
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('+textContent');

        if (!pdf) {
            console.error(`[summarizePDF] PDF not found with ID ${req.params.id} for user ${req.user._id}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        if (!pdf.textContent || pdf.textContent.trim() === '') {
            console.error(`[summarizePDF] PDF ${pdf._id} has no text content to summarize`);
            return res.status(400).json({
                success: false,
                message: 'PDF has no text content to summarize'
            });
        }

        console.log(`[summarizePDF] Sending prompt to Gemini AI for PDF: ${pdf._id}`);
        const prompt = `Please provide a comprehensive summary of the following text: ${pdf.textContent}`;

        try {
            const result = await model.generateContent(prompt);
            const summary = result.response.text();

            console.log(`[summarizePDF] Successfully generated summary for PDF: ${pdf._id}`);

            pdf.summary = summary;
            await pdf.save();
            console.log(`[summarizePDF] Summary saved for PDF: ${pdf._id}`);

            res.status(200).json({
                success: true,
                data: {
                    summary: pdf.summary
                }
            });
        } catch (aiError) {
            console.error("[summarizePDF] AI processing error:", {
                message: aiError.message,
                stack: aiError.stack,
                name: aiError.name
            });

            res.status(500).json({
                success: false,
                message: 'Failed to generate summary with AI',
                error: aiError.message
            });
        }
    } catch (error) {
        console.error("[summarizePDF] Error summarizing PDF:", {
            id: req.params.id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to summarize PDF',
            error: error.message
        });
    }
};

// Ask question about PDF
export const askQuestion = async (req, res) => {
    console.log("[askQuestion] Processing question for PDF:", req.params.id);
    try {
        if (!req.params.id) {
            console.error("[askQuestion] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        if (!req.user?._id) {
            console.error("[askQuestion] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        const { question } = req.body;
        if (!question || question.trim() === '') {
            console.error("[askQuestion] No question provided in request body");
            return res.status(400).json({
                success: false,
                message: 'Question is required'
            });
        }

        console.log(`[askQuestion] Finding PDF with ID ${req.params.id} for user ${req.user._id}`);
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('+textContent');

        if (!pdf) {
            console.error(`[askQuestion] PDF not found with ID ${req.params.id} for user ${req.user._id}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        if (!pdf.textContent || pdf.textContent.trim() === '') {
            console.error(`[askQuestion] PDF ${pdf._id} has no text content to analyze`);
            return res.status(400).json({
                success: false,
                message: 'PDF has no text content to analyze'
            });
        }

        console.log(`[askQuestion] Processing question for PDF: ${pdf._id}`);
        console.log(`[askQuestion] Question: "${question}"`);

        try {
            const prompt = `Based on the following text: "${pdf.textContent}", please answer this question: ${question}`;
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            console.log(`[askQuestion] Successfully generated response for question on PDF: ${pdf._id}`);

            // Save chat
            console.log(`[askQuestion] Saving chat for PDF: ${pdf._id}`);
            const chat = await Chat.create({
                pdfId: pdf._id,
                userId: req.user._id,
                question,
                response
            });
            console.log(`[askQuestion] Chat saved with ID: ${chat._id}`);

            // Add chat to PDF
            await pdf.addChat(chat._id);
            console.log(`[askQuestion] Chat ${chat._id} added to PDF ${pdf._id}`);

            res.status(200).json({
                success: true,
                data: chat
            });
        } catch (aiError) {
            console.error("[askQuestion] AI processing error:", {
                message: aiError.message,
                stack: aiError.stack,
                name: aiError.name
            });

            res.status(500).json({
                success: false,
                message: 'Failed to process question with AI',
                error: aiError.message
            });
        }
    } catch (error) {
        console.error("[askQuestion] Error processing question:", {
            pdfId: req.params.id,
            question: req.body.question,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to process question',
            error: error.message
        });
    }
};

// Generate PDF flow
export const generatePDFFlow = async (req, res) => {
    console.log("[generatePDFFlow] Generating structural flow for PDF:", req.params.id);
    try {
        if (!req.params.id) {
            console.error("[generatePDFFlow] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        if (!req.user?._id) {
            console.error("[generatePDFFlow] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[generatePDFFlow] Finding PDF with ID ${req.params.id} for user ${req.user._id}`);
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select('+textContent');

        if (!pdf) {
            console.error(`[generatePDFFlow] PDF not found with ID ${req.params.id} for user ${req.user._id}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        if (!pdf.textContent || pdf.textContent.trim() === '') {
            console.error(`[generatePDFFlow] PDF ${pdf._id} has no text content to analyze`);
            return res.status(400).json({
                success: false,
                message: 'PDF has no text content to analyze'
            });
        }

        console.log(`[generatePDFFlow] Generating flow for PDF: ${pdf._id}`);

        try {
            const prompt = `Generate a structured flow or outline of the main concepts and their relationships from the following text: ${pdf.textContent}`;
            const result = await model.generateContent(prompt);
            const flow = result.response.text();

            console.log(`[generatePDFFlow] Successfully generated flow for PDF: ${pdf._id}`);

            res.status(200).json({
                success: true,
                data: {
                    flow
                }
            });
        } catch (aiError) {
            console.error("[generatePDFFlow] AI processing error:", {
                message: aiError.message,
                stack: aiError.stack,
                name: aiError.name
            });

            res.status(500).json({
                success: false,
                message: 'Failed to generate flow with AI',
                error: aiError.message
            });
        }
    } catch (error) {
        console.error("[generatePDFFlow] Error generating flow:", {
            id: req.params.id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF flow',
            error: error.message
        });
    }
};