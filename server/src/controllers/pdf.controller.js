import { uploadPDFToCloudinary } from '../config/cloudinary.js';
import PDF from '../models/pdf.model.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import { v2 as cloudinary } from 'cloudinary';
import { getRelevantContext, preprocessPDFContent } from '../utils/textChunking.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        console.log("[uploadPDF] Parsing PDF content");
        let pdfContent = '';
        try {
            // Download the PDF from Cloudinary since we have the URL
            console.log("[uploadPDF] Downloading PDF from Cloudinary");

            // Use secure_url if available, otherwise use the regular URL
            const downloadUrl = result.secure_url || result.url;
            console.log("[uploadPDF] Download URL:", downloadUrl);

            // Remove authentication headers - public resources don't need them
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const pdfBuffer = Buffer.from(arrayBuffer);
            console.log("[uploadPDF] PDF downloaded successfully, parsing content");

            const pdfData = await pdfParse(pdfBuffer);
            pdfContent = pdfData.text;
            console.log("[uploadPDF] PDF parsed successfully, extracted", pdfContent.length, "characters");
        } catch (parseError) {
            console.error("[uploadPDF] Error parsing PDF:", parseError);
            pdfContent = "Failed to extract text from PDF.";
        }
        // Create PDF document
        console.log("[uploadPDF] Creating PDF document in database");
        
        // Pre-process the content into chunks for better search performance
        let chunks = [];
        if (pdfContent && pdfContent.length > 0) {
            console.log("[uploadPDF] Pre-processing PDF content into chunks");
            chunks = preprocessPDFContent(pdfContent, {
                maxChunkSize: 2000,
                overlap: 200,
                includeMetadata: true
            });
            console.log(`[uploadPDF] Created ${chunks.length} chunks for storage`);
        }

        const pdf = await PDF.create({
            user: req.body.userId,
            title: req.body.title || req.file.originalname,
            originalFilename: req.file.originalname,
            url: result.url,
            textContent: pdfContent,
            chunks: chunks,
            chunkingEnabled: true,
            fileSize: req.file.size || 0, // Store file size in bytes
            mimeType: req.file.mimetype || 'application/pdf',
            status: 'ready'
        });

        // Return response without the textContent field
        const responseData = pdf.toObject();
        delete responseData.textContent;

        console.log("[uploadPDF] PDF document created successfully:", {
            id: pdf._id,
            title: pdf.title,
            user: pdf.user
        });

        res.status(201).json({
            success: true,
            data: responseData
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

// Get all PDFs for user
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
                chatCount: pdf.chats.length,
                createdAt: pdf.createdAt // Make sure createdAt is included
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
        
        const userId = req.user._id;
        if (!userId) {
            console.error("[deletePDF] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[deletePDF] Finding PDF with ID ${req.params.id} for user ${userId}`);
        // First find the PDF to get its details before deletion
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: userId
        }).populate('collections');

        if (!pdf) {
            console.error(`[deletePDF] PDF not found with ID ${req.params.id} for user ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        // Delete associated chats
        console.log(`[deletePDF] Deleting associated chats for PDF: ${pdf._id}`);
        const deleteResult = await Chat.deleteMany({ pdfId: pdf._id });
        console.log(`[deletePDF] Deleted ${deleteResult.deletedCount} chats associated with PDF ${pdf._id}`);

        // Remove PDF from all collections
        if (pdf.collections && pdf.collections.length > 0) {
            console.log(`[deletePDF] Removing PDF from ${pdf.collections.length} collections`);
            const Collection = (await import('../models/collection.model.js')).default;
            
            for (const collection of pdf.collections) {
                await Collection.findByIdAndUpdate(
                    collection._id,
                    { $pull: { documents: pdf._id } }
                );
                console.log(`[deletePDF] Removed PDF from collection: ${collection.name}`);
            }
        }

        // Clean up from Cloudinary if needed
        try {
            if (pdf.url) {
                console.log(`[deletePDF] Attempting to clean up Cloudinary resource for PDF: ${pdf._id}`);
                // Extract public_id from Cloudinary URL
                const urlParts = pdf.url.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = `pdfs/${filename.split('.')[0]}`;
                
                const { deleteFromCloudinary } = await import('../config/cloudinary.js');
                const cloudinaryResult = await deleteFromCloudinary(publicId);
                
                if (cloudinaryResult.success) {
                    console.log(`[deletePDF] Successfully deleted from Cloudinary: ${publicId}`);
                } else {
                    console.warn(`[deletePDF] Failed to delete from Cloudinary: ${cloudinaryResult.error}`);
                }
            }
        } catch (cloudinaryError) {
            console.warn(`[deletePDF] Cloudinary cleanup failed (non-critical): ${cloudinaryError.message}`);
        }

        // Delete the PDF document
        await PDF.findByIdAndDelete(pdf._id);
        console.log(`[deletePDF] Successfully deleted PDF: ${pdf._id}`);

        res.status(200).json({
            success: true,
            message: 'PDF and all related data deleted successfully',
            data: {
                deletedChats: deleteResult.deletedCount,
                removedFromCollections: pdf.collections ? pdf.collections.length : 0
            }
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

// Ask question about PDF with semantic search
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

        const { question, userId } = req.body;
        console.log(userId)
        if (!userId) {
            console.error("[askQuestion] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        if (!question || question.trim() === '') {
            console.error("[askQuestion] No question provided in request body");
            return res.status(400).json({
                success: false,
                message: 'Question is required'
            });
        }

        console.log(`[askQuestion] Finding PDF with ID ${req.params.id} for user ${userId}`);
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: userId
        }).select('+textContent +chunks');

        if (!pdf) {
            console.error(`[askQuestion] PDF not found with ID ${req.params.id} for user ${userId}`);
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
            let contextText = '';
            let metadata = {};

            // Use semantic search to find relevant chunks
            if (pdf.chunkingEnabled && pdf.chunks && pdf.chunks.length > 0) {
                console.log(`[askQuestion] Using pre-stored chunks (${pdf.chunks.length} available) for semantic search`);
                
                // Convert stored chunks back to the format expected by findRelevantChunks
                const chunksForSearch = pdf.chunks.map(chunk => ({
                    text: chunk.text,
                    startIndex: chunk.startIndex,
                    endIndex: chunk.endIndex,
                    length: chunk.length,
                    chunkId: chunk.chunkId
                }));

                const relevantContext = await getRelevantContext(question, pdf.textContent, {
                    maxChunkSize: 2000,
                    overlap: 200,
                    topK: 3,
                    maxContextLength: 6000
                });

                contextText = relevantContext.contextText;
                metadata = relevantContext.metadata;
                
                console.log(`[askQuestion] Using semantic search: ${metadata.selectedChunks}/${metadata.totalChunks} chunks, ${metadata.contextLength} chars, avg relevance: ${metadata.averageRelevanceScore?.toFixed(2)}`);
            } else {
                console.log(`[askQuestion] No chunks available, using full content with length limit`);
                // Fallback: use the first portion of the document if it's very long
                const maxLength = 6000;
                if (pdf.textContent.length > maxLength) {
                    contextText = pdf.textContent.substring(0, maxLength) + '\n[Note: Document truncated for processing]';
                    console.log(`[askQuestion] Content truncated from ${pdf.textContent.length} to ${contextText.length} characters`);
                } else {
                    contextText = pdf.textContent;
                }
                metadata = {
                    totalChunks: 1,
                    selectedChunks: 1,
                    contextLength: contextText.length,
                    averageRelevanceScore: 1.0,
                    method: 'full-content'
                };
            }

            // Create enhanced prompt with context information
            const prompt = `You are analyzing a document to answer a specific question. Use the provided relevant sections to give an accurate and helpful response.

QUESTION: ${question}

RELEVANT DOCUMENT SECTIONS:
${contextText}

INSTRUCTIONS:
1. Answer the question based on the provided sections
2. If the information is not fully covered in these sections, mention that
3. Be specific and cite relevant parts when possible
4. If you need to make inferences, clearly indicate them
5. Keep your response focused and concise

ANSWER:`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            console.log(`[askQuestion] Successfully generated response for question on PDF: ${pdf._id}`);
            console.log(`[askQuestion] Context used: ${metadata.contextLength} characters from ${metadata.selectedChunks} chunks`);

            // Save chat with metadata about the search
            console.log(`[askQuestion] Saving chat for PDF: ${pdf._id}`);
            const chat = await Chat.create({
                pdfId: pdf._id,
                userId: userId,
                question,
                response,
                metadata: {
                    searchMethod: pdf.chunkingEnabled ? 'semantic_search' : 'full_content',
                    chunksUsed: metadata.selectedChunks || 1,
                    totalChunks: metadata.totalChunks || 1,
                    contextLength: metadata.contextLength,
                    averageRelevanceScore: metadata.averageRelevanceScore
                }
            });
            console.log(`[askQuestion] Chat saved with ID: ${chat._id}`);

            // Add chat to PDF
            await pdf.addChat(chat._id);
            console.log(`[askQuestion] Chat ${chat._id} added to PDF ${pdf._id}`);

            res.status(200).json({
                success: true,
                data: {
                    ...chat.toObject(),
                    searchMetadata: metadata
                }
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

export const updateNotes = async (req, res) => {
    console.log("[updateNotes] Updating notes for PDF:", req.params.id);
    try {
        const { notes } = req.body;
        const { userId } = req.body;

        if (!req.params.id) {
            console.error("[updateNotes] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        if (!userId) {
            console.error("[updateNotes] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[updateNotes] Finding PDF with ID ${req.params.id} for user ${userId}`);
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: userId
        });

        if (!pdf) {
            console.error(`[updateNotes] PDF not found with ID ${req.params.id} for user ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        pdf.notes = notes;
        await pdf.save();

        console.log(`[updateNotes] Successfully updated notes for PDF: ${pdf._id}`);
        res.status(200).json({
            success: true,
            data: {
                notes: pdf.notes
            }
        });
    } catch (error) {
        console.error("[updateNotes] Error updating notes:", {
            id: req.params.id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to update notes',
            error: error.message
        });
    }
};

// Get PDF notes
export const getNotes = async (req, res) => {
    console.log("[getNotes] Fetching notes for PDF:", req.params.id);
    try {
        const userId = req.query.userId || req.body.userId; // Check both query and body

        if (!req.params.id) {
            console.error("[getNotes] No PDF ID provided");
            return res.status(400).json({
                success: false,
                message: 'PDF ID is required'
            });
        }

        if (!userId) {
            console.error("[getNotes] No user ID available");
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log(`[getNotes] Finding PDF with ID ${req.params.id} for user ${userId}`);
        const pdf = await PDF.findOne({
            _id: req.params.id,
            user: userId
        });

        if (!pdf) {
            console.error(`[getNotes] PDF not found with ID ${req.params.id} for user ${userId}`);
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        console.log(`[getNotes] Successfully retrieved notes for PDF: ${pdf._id}`);
        res.status(200).json({
            success: true,
            data: {
                notes: pdf.notes
            }
        });
    } catch (error) {
        console.error("[getNotes] Error fetching notes:", {
            id: req.params.id,
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            success: false,
            message: 'Failed to fetch notes',
            error: error.message
        });
    }
};

// Enhanced search functionality
export const searchDocuments = async (req, res) => {
    console.log('[searchDocuments] Searching documents');
    try {
        const { query, tags, collections, dateFrom, dateTo, fileSize, sortBy = 'uploadedAt', sortOrder = 'desc' } = req.query;
        const userId = req.user._id;

        let searchCriteria = {
            $or: [
                { user: userId },
                { 'sharedWith.user': userId },
                { isPublic: true }
            ]
        };

        // Text search
        if (query) {
            searchCriteria.$and = searchCriteria.$and || [];
            searchCriteria.$and.push({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { 'metadata.author': { $regex: query, $options: 'i' } },
                    { 'metadata.subject': { $regex: query, $options: 'i' } },
                    { tags: { $in: [query] } }
                ]
            });
        }

        // Filter by tags
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            searchCriteria.tags = { $in: tagArray };
        }

        // Filter by collections
        if (collections) {
            const collectionArray = Array.isArray(collections) ? collections : collections.split(',');
            searchCriteria.collections = { $in: collectionArray };
        }

        // Date range filter
        if (dateFrom || dateTo) {
            searchCriteria.uploadedAt = {};
            if (dateFrom) searchCriteria.uploadedAt.$gte = new Date(dateFrom);
            if (dateTo) searchCriteria.uploadedAt.$lte = new Date(dateTo);
        }

        // File size filter
        if (fileSize) {
            const sizeFilter = fileSize.split('-');
            if (sizeFilter.length === 2) {
                searchCriteria.fileSize = {
                    $gte: parseInt(sizeFilter[0]) * 1024 * 1024, // Convert MB to bytes
                    $lte: parseInt(sizeFilter[1]) * 1024 * 1024
                };
            }
        }

        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const documents = await PDF.find(searchCriteria)
            .populate('collections', 'name color')
            .populate('user', 'username email')
            .sort(sortObj)
            .limit(100); // Limit results for performance

        console.log(`[searchDocuments] Found ${documents.length} documents`);
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        console.error('[searchDocuments] Error searching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching documents',
            error: error.message
        });
    }
};

// Bulk operations
export const bulkOperations = async (req, res) => {
    console.log('[bulkOperations] Processing bulk operation');
    try {
        const { operation, documentIds, data } = req.body;
        const userId = req.user._id;

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

        let result;
        switch (operation) {
            case 'delete':
                result = await PDF.deleteMany({ _id: { $in: documentIds } });
                break;
            case 'addTags':
                result = await PDF.updateMany(
                    { _id: { $in: documentIds } },
                    { $addToSet: { tags: { $each: data.tags } } }
                );
                break;
            case 'removeTags':
                result = await PDF.updateMany(
                    { _id: { $in: documentIds } },
                    { $pull: { tags: { $in: data.tags } } }
                );
                break;
            case 'addToCollection':
                result = await PDF.updateMany(
                    { _id: { $in: documentIds } },
                    { $addToSet: { collections: data.collectionId } }
                );
                break;
            case 'removeFromCollection':
                result = await PDF.updateMany(
                    { _id: { $in: documentIds } },
                    { $pull: { collections: data.collectionId } }
                );
                break;
            case 'toggleFavorite':
                // For each document, toggle its favorite status
                const updates = await Promise.all(
                    documents.map(async (doc) => {
                        return PDF.findByIdAndUpdate(
                            doc._id,
                            { isFavorite: !doc.isFavorite },
                            { new: true }
                        );
                    })
                );
                result = { modifiedCount: updates.length };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid operation'
                });
        }

        console.log(`[bulkOperations] ${operation} completed for ${result.modifiedCount || result.deletedCount} documents`);
        res.status(200).json({
            success: true,
            message: `${operation} completed for ${result.modifiedCount || result.deletedCount} documents`,
            data: result
        });
    } catch (error) {
        console.error('[bulkOperations] Error in bulk operation:', error);
        res.status(500).json({
            success: false,
            message: 'Error in bulk operation',
            error: error.message
        });
    }
};

// Share document
export const shareDocument = async (req, res) => {
    console.log(`[shareDocument] Sharing document: ${req.params.id}`);
    try {
        const { id } = req.params;
        const { email, permission = 'read' } = req.body;
        const userId = req.user._id;

        const document = await PDF.findById(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (!document.user.equals(userId)) {
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
        const existingShare = document.sharedWith.find(share => 
            share.user.equals(targetUser._id)
        );

        if (existingShare) {
            existingShare.permission = permission;
        } else {
            document.sharedWith.push({
                user: targetUser._id,
                permission,
                sharedAt: new Date()
            });
        }

        await document.save();

        console.log(`[shareDocument] Document shared with ${email}`);
        res.status(200).json({
            success: true,
            message: `Document shared with ${email}`,
            data: document
        });
    } catch (error) {
        console.error('[shareDocument] Error sharing document:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing document',
            error: error.message
        });
    }
};

// Get document versions
export const getDocumentVersions = async (req, res) => {
    console.log(`[getDocumentVersions] Getting versions for document: ${req.params.id}`);
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const document = await PDF.findById(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (!document.hasPermission(userId, 'read')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Track access
        await document.trackAccess();

        res.status(200).json({
            success: true,
            data: {
                currentVersion: document.version,
                versions: document.versions
            }
        });
    } catch (error) {
        console.error('[getDocumentVersions] Error getting versions:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting document versions',
            error: error.message
        });
    }
};

// Toggle favorite
export const toggleFavorite = async (req, res) => {
    console.log(`[toggleFavorite] Toggling favorite for document: ${req.params.id}`);
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const document = await PDF.findOne({
            _id: id,
            $or: [
                { user: userId },
                { 'sharedWith.user': userId }
            ]
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        document.isFavorite = !document.isFavorite;
        await document.save();

        console.log(`[toggleFavorite] Document favorite toggled to: ${document.isFavorite}`);
        res.status(200).json({
            success: true,
            data: { isFavorite: document.isFavorite }
        });
    } catch (error) {
        console.error('[toggleFavorite] Error toggling favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling favorite',
            error: error.message
        });
    }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
    console.log('[getUserAnalytics] Getting user analytics');
    try {
        const userId = req.user._id;

        const analytics = await PDF.aggregate([
            {
                $match: {
                    $or: [
                        { user: userId },
                        { 'sharedWith.user': userId }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalDocuments: { $sum: 1 },
                    totalFileSize: { $sum: '$fileSize' },
                    totalAccess: { $sum: '$accessCount' },
                    favoriteCount: {
                        $sum: {
                            $cond: [{ $eq: ['$isFavorite', true] }, 1, 0]
                        }
                    },
                    avgFileSize: { $avg: '$fileSize' }
                }
            }
        ]);

        const tagStats = await PDF.aggregate([
            {
                $match: {
                    $or: [
                        { user: userId },
                        { 'sharedWith.user': userId }
                    ]
                }
            },
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const recentActivity = await PDF.find({
            $or: [
                { user: userId },
                { 'sharedWith.user': userId }
            ]
        })
        .sort({ lastAccessedAt: -1 })
        .limit(10)
        .select('title lastAccessedAt accessCount');

        console.log('[getUserAnalytics] Analytics calculated');
        res.status(200).json({
            success: true,
            data: {
                overview: analytics[0] || {
                    totalDocuments: 0,
                    totalFileSize: 0,
                    totalAccess: 0,
                    favoriteCount: 0,
                    avgFileSize: 0
                },
                topTags: tagStats,
                recentActivity
            }
        });
    } catch (error) {
        console.error('[getUserAnalytics] Error getting analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting analytics',
            error: error.message
        });
    }
};

// Update file sizes for existing documents
export const updateFileSizes = async (req, res) => {
    try {
        console.log("[updateFileSizes] Starting file size update process");
        
        // Find documents without file sizes
        const documentsWithoutSize = await PDF.find({
            $or: [
                { fileSize: { $exists: false } },
                { fileSize: 0 },
                { fileSize: null }
            ]
        }).select('url title _id');

        console.log(`[updateFileSizes] Found ${documentsWithoutSize.length} documents without file sizes`);

        let updatedCount = 0;
        let errorCount = 0;

        for (const doc of documentsWithoutSize) {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = doc.url.split('/');
                const fileNameWithExtension = urlParts[urlParts.length - 1];
                const fileName = fileNameWithExtension.split('.')[0];
                const publicId = `pdfs/${fileName}`;

                // Get resource details from Cloudinary
                const result = await cloudinary.api.resource(publicId, { resource_type: 'image' });
                
                if (result && result.bytes) {
                    await PDF.findByIdAndUpdate(doc._id, { 
                        fileSize: result.bytes,
                        mimeType: 'application/pdf'
                    });
                    updatedCount++;
                    console.log(`[updateFileSizes] Updated ${doc.title}: ${result.bytes} bytes`);
                } else {
                    console.warn(`[updateFileSizes] No size info for ${doc.title}`);
                }
            } catch (error) {
                console.error(`[updateFileSizes] Error updating ${doc.title}:`, error.message);
                errorCount++;
            }
        }

        console.log(`[updateFileSizes] Completed: ${updatedCount} updated, ${errorCount} errors`);

        res.json({
            success: true,
            message: `Updated ${updatedCount} documents. ${errorCount} errors encountered.`,
            updated: updatedCount,
            errors: errorCount,
            total: documentsWithoutSize.length
        });

    } catch (error) {
        console.error("[updateFileSizes] Error:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to update file sizes',
            error: error.message
        });
    }
};

// Re-chunk existing PDFs for semantic search
export const rechunkPDFs = async (req, res) => {
    try {
        console.log("[rechunkPDFs] Starting re-chunking process for existing PDFs");
        
        // Find PDFs that don't have chunks or have chunking disabled
        const pdfsToChunk = await PDF.find({
            $or: [
                { chunks: { $exists: false } },
                { chunks: { $size: 0 } },
                { chunkingEnabled: false },
                { chunkingEnabled: { $exists: false } }
            ],
            textContent: { $exists: true, $ne: '' }
        }).select('+textContent');

        console.log(`[rechunkPDFs] Found ${pdfsToChunk.length} PDFs to re-chunk`);

        let processedCount = 0;
        let errorCount = 0;

        for (const pdf of pdfsToChunk) {
            try {
                if (!pdf.textContent || pdf.textContent.trim() === '') {
                    console.log(`[rechunkPDFs] Skipping PDF ${pdf._id} - no text content`);
                    continue;
                }

                console.log(`[rechunkPDFs] Processing PDF: ${pdf.title} (${pdf.textContent.length} characters)`);
                
                // Generate chunks
                const chunks = preprocessPDFContent(pdf.textContent, {
                    maxChunkSize: 2000,
                    overlap: 200,
                    includeMetadata: true
                });

                // Update the PDF with chunks
                await PDF.findByIdAndUpdate(pdf._id, {
                    chunks: chunks,
                    chunkingEnabled: true,
                    status: 'ready'
                });

                processedCount++;
                console.log(`[rechunkPDFs] Successfully chunked ${pdf.title}: ${chunks.length} chunks created`);

            } catch (error) {
                console.error(`[rechunkPDFs] Error processing PDF ${pdf.title}:`, error.message);
                errorCount++;
            }
        }

        console.log(`[rechunkPDFs] Completed: ${processedCount} processed, ${errorCount} errors`);

        res.json({
            success: true,
            message: `Re-chunked ${processedCount} PDFs. ${errorCount} errors encountered.`,
            processed: processedCount,
            errors: errorCount,
            total: pdfsToChunk.length
        });

    } catch (error) {
        console.error("[rechunkPDFs] Error:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to re-chunk PDFs',
            error: error.message
        });
    }
};

// Get chunking statistics for a PDF
export const getChunkingStats = async (req, res) => {
    try {
        console.log(`[getChunkingStats] Getting chunking stats for PDF: ${req.params.id}`);
        
        const pdf = await PDF.findById(req.params.id).select('+chunks +textContent');
        
        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        const stats = {
            pdfId: pdf._id,
            title: pdf.title,
            chunkingEnabled: pdf.chunkingEnabled || false,
            totalTextLength: pdf.textContent ? pdf.textContent.length : 0,
            totalChunks: pdf.chunks ? pdf.chunks.length : 0,
            averageChunkSize: 0,
            chunkSizeDistribution: {
                small: 0,    // < 1000 chars
                medium: 0,   // 1000-2000 chars
                large: 0     // > 2000 chars
            }
        };

        if (pdf.chunks && pdf.chunks.length > 0) {
            const chunkSizes = pdf.chunks.map(chunk => chunk.length);
            stats.averageChunkSize = chunkSizes.reduce((sum, size) => sum + size, 0) / chunkSizes.length;
            
            stats.chunkSizeDistribution.small = chunkSizes.filter(size => size < 1000).length;
            stats.chunkSizeDistribution.medium = chunkSizes.filter(size => size >= 1000 && size <= 2000).length;
            stats.chunkSizeDistribution.large = chunkSizes.filter(size => size > 2000).length;
            
            stats.chunkDetails = pdf.chunks.map(chunk => ({
                chunkId: chunk.chunkId,
                length: chunk.length,
                wordCount: chunk.wordCount,
                hasNumbers: chunk.hasNumbers,
                hasFormulas: chunk.hasFormulas,
                sentences: chunk.sentences,
                preview: chunk.text.substring(0, 100) + '...'
            }));
        }

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("[getChunkingStats] Error:", error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chunking statistics',
            error: error.message
        });
    }
};