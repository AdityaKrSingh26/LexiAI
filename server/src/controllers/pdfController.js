import PDF from '../models/PDF.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import geminiConfig from '../config/gemini.js';
import { processAndExtractText } from '../utils/pdfParser.js';
import { generateSummary } from '../utils/summarizer.js';
import { createFlowchart } from '../utils/flowchartGenerator.js';

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    }
});

// Upload PDF and create a new entry
export const uploadPDF = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description } = req.body;
        const filePath = req.file.path;

        const newPdf = new PDF({
            userId,
            title: title || req.file.originalname,
            description,
            filePath,
            uploadDate: new Date()
        });

        await newPdf.save();
        res.status(201).json({ message: 'PDF uploaded successfully', pdf: newPdf });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading PDF', error: error.message });
    }
};

// Get all PDFs for a user
export const getUserPDFs = async (req, res) => {
    try {
        const userId = req.user.id;
        const pdfs = await PDF.find({ userId }).sort({ uploadDate: -1 });
        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving PDFs', error: error.message });
    }
};

// Get a specific PDF by ID
export const getPDFById = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const pdf = await PDF.findById(pdfId);

        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        if (pdf.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this PDF' });
        }

        res.status(200).json(pdf);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving PDF', error: error.message });
    }
};

// Delete a PDF
export const deletePDF = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const pdf = await PDF.findById(pdfId);

        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        if (pdf.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this PDF' });
        }

        // Delete file from storage
        fs.unlinkSync(pdf.filePath);

        // Delete from database
        await PDF.findByIdAndDelete(pdfId);

        res.status(200).json({ message: 'PDF deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting PDF', error: error.message });
    }
};

// Summarize a PDF
export const summarizePDF = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const pdf = await PDF.findById(pdfId);

        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        if (pdf.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this PDF' });
        }

        // Extract text from PDF
        const pdfText = await processAndExtractText(pdf.filePath);

        // Generate summary using AI
        const summary = await generateSummary(pdfText, geminiConfig);

        res.status(200).json({ summary });
    } catch (error) {
        res.status(500).json({ message: 'Error summarizing PDF', error: error.message });
    }
};

// Interact with the Gemini AI model
export const interactWithAI = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        const pdf = await PDF.findById(pdfId);

        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        if (pdf.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this PDF' });
        }

        // Extract text from PDF if not already cached
        const pdfText = await processAndExtractText(pdf.filePath);

        // Use AI service to generate a response based on the PDF content and question
        const response = await generateResponse(question, pdfText, geminiConfig);

        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ message: 'Error interacting with AI', error: error.message });
    }
};

// Generate a flowchart from PDF
export const generateFlowchart = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const pdf = await PDF.findById(pdfId);

        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        if (pdf.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this PDF' });
        }

        // Extract text from PDF
        const pdfText = await processAndExtractText(pdf.filePath);

        // Generate flowchart using AI
        const flowchart = await createFlowchart(pdfText, geminiConfig);

        res.status(200).json({ flowchart });
    } catch (error) {
        res.status(500).json({ message: 'Error generating flowchart', error: error.message });
    }
};

// Helper function for AI interactions
async function generateResponse(question, context, config) {
    // Implementation will depend on your AI service integration
    // This is just a placeholder
    // You would typically call gemini API here
    try {
        // Make API call to Gemini AI
        // Return the response
        return "This is a sample response from the AI model";
    } catch (error) {
        throw new Error(`Failed to generate response: ${error.message}`);
    }
}