const Chat = require('../models/Chat');
const PDF = require('../models/PDF');

// Function to save a chat
const saveChat = async (userId, pdfId, chatContent) => {
    try {
        const chat = new Chat({
            userId,
            pdfId,
            content: chatContent,
            createdAt: new Date()
        });
        await chat.save();
        return chat;
    } catch (error) {
        throw new Error('Error saving chat: ' + error.message);
    }
};

// Function to retrieve chat history for a specific PDF
const getChatHistory = async (userId, pdfId) => {
    try {
        const chats = await Chat.find({ userId, pdfId }).sort({ createdAt: -1 });
        return chats;
    } catch (error) {
        throw new Error('Error retrieving chat history: ' + error.message);
    }
};

// Function to delete a chat
const deleteChat = async (chatId) => {
    try {
        await Chat.findByIdAndDelete(chatId);
        return { message: 'Chat deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting chat: ' + error.message);
    }
};

module.exports = {
    saveChat,
    getChatHistory,
    deleteChat
};