const PDF = require('../models/PDF');
const Chat = require('../models/Chat');
const pdfParser = require('../utils/pdfParser');
const summarizer = require('../utils/summarizer');
const flowchartGenerator = require('../utils/flowchartGenerator');

const pdfService = {
    uploadPDF: async (userId, file) => {
        const parsedData = await pdfParser.parsePDF(file);
        const newPDF = new PDF({
            userId,
            file: file.path,
            chats: []
        });
        await newPDF.save();
        return newPDF;
    },

    summarizePDF: async (pdfId) => {
        const pdf = await PDF.findById(pdfId);
        if (!pdf) throw new Error('PDF not found');
        const summary = await summarizer.summarize(pdf.file);
        return summary;
    },

    generateFlowchart: async (pdfId) => {
        const pdf = await PDF.findById(pdfId);
        if (!pdf) throw new Error('PDF not found');
        const flowchart = await flowchartGenerator.generateFlowchart(pdf.file);
        return flowchart;
    },

    addChatToPDF: async (pdfId, userId, chatContent) => {
        const chat = new Chat({
            pdfId,
            userId,
            content: chatContent
        });
        await chat.save();
        await PDF.findByIdAndUpdate(pdfId, { $push: { chats: chat._id } });
        return chat;
    },

    getChatHistory: async (pdfId) => {
        const pdf = await PDF.findById(pdfId).populate('chats');
        if (!pdf) throw new Error('PDF not found');
        return pdf.chats;
    }
};

module.exports = pdfService;