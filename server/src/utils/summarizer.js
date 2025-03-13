const { GeminiClient } = require('gemini-ai-client'); // Import the Gemini AI client

const geminiClient = new GeminiClient(); // Initialize the Gemini AI client

/**
 * Summarizes the content of a PDF using the Gemini AI model.
 * @param {string} pdfContent - The text content of the PDF to be summarized.
 * @returns {Promise<string>} - A promise that resolves to the summary of the PDF.
 */
const summarizePDF = async (pdfContent) => {
    try {
        const summary = await geminiClient.summarize(pdfContent); // Call the summarize method of the Gemini client
        return summary; // Return the summary
    } catch (error) {
        throw new Error('Error summarizing PDF: ' + error.message); // Handle errors
    }
};

module.exports = {
    summarizePDF, // Export the summarizePDF function
};