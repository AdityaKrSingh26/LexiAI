const Chat = require('../models/Chat');
const PDF = require('../models/PDF');

// Save a new chat
exports.saveChat = async (req, res) => {
    try {
        const { pdfId, userId, content } = req.body;
        const chat = new Chat({ pdfId, userId, content });
        await chat.save();
        res.status(201).json({ message: 'Chat saved successfully', chat });
    } catch (error) {
        res.status(500).json({ message: 'Error saving chat', error });
    }
};

// Retrieve chat history for a specific PDF
exports.getChatHistory = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const chats = await Chat.find({ pdfId }).populate('userId', 'username');
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving chat history', error });
    }
};