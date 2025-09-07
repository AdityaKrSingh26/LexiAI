import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI for embeddings (we'll use text similarity for now)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Split text into chunks with overlap
 * @param {string} text - The text to chunk
 * @param {number} maxChunkSize - Maximum size of each chunk
 * @param {number} overlap - Number of characters to overlap between chunks
 * @returns {Array} Array of text chunks
 */
export const chunkText = (text, maxChunkSize = 2000, overlap = 200) => {
    console.log(`[chunkText] Chunking text of length ${text.length} with maxChunkSize: ${maxChunkSize}, overlap: ${overlap}`);
    
    if (!text || text.length === 0) {
        return [];
    }

    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + maxChunkSize, text.length);
        
        // Try to break at sentence or paragraph boundaries
        if (endIndex < text.length) {
            // Look for sentence end within the last 200 characters
            const searchStart = Math.max(endIndex - 200, startIndex);
            const sentenceEnd = text.lastIndexOf('.', endIndex);
            const paragraphEnd = text.lastIndexOf('\n\n', endIndex);
            const questionEnd = text.lastIndexOf('?', endIndex);
            const exclamationEnd = text.lastIndexOf('!', endIndex);
            
            // Find the best break point
            const breakPoint = Math.max(sentenceEnd, paragraphEnd, questionEnd, exclamationEnd);
            
            if (breakPoint > searchStart) {
                endIndex = breakPoint + 1;
            }
        }
        
        const chunk = text.slice(startIndex, endIndex).trim();
        if (chunk.length > 0) {
            chunks.push({
                text: chunk,
                startIndex,
                endIndex,
                length: chunk.length
            });
        }
        
        // Move start index forward, accounting for overlap
        startIndex = Math.max(endIndex - overlap, startIndex + 1);
        
        // Prevent infinite loop
        if (startIndex >= endIndex) {
            break;
        }
    }

    console.log(`[chunkText] Created ${chunks.length} chunks`);
    return chunks;
};

/**
 * Calculate simple text similarity using keyword matching
 * @param {string} query - The search query
 * @param {string} text - The text to compare against
 * @returns {number} Similarity score (0-1)
 */
const calculateTextSimilarity = (query, text) => {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    let totalQueryWords = queryWords.length;
    
    queryWords.forEach(queryWord => {
        if (textWords.some(textWord => 
            textWord.includes(queryWord) || queryWord.includes(textWord)
        )) {
            matches++;
        }
    });
    
    return totalQueryWords > 0 ? matches / totalQueryWords : 0;
};

/**
 * Find the most relevant chunks for a given query using AI
 * @param {string} query - The search query
 * @param {Array} chunks - Array of text chunks
 * @param {number} topK - Number of top chunks to return
 * @returns {Array} Array of relevant chunks with scores
 */
export const findRelevantChunks = async (query, chunks, topK = 3) => {
    console.log(`[findRelevantChunks] Finding relevant chunks for query: "${query}" from ${chunks.length} chunks`);
    
    if (!chunks || chunks.length === 0) {
        return [];
    }

    try {
        // For better performance with large documents, use a two-stage approach:
        // 1. First, filter using simple keyword matching
        // 2. Then, use AI to rank the filtered chunks
        
        // Stage 1: Simple keyword filtering
        const keywordFiltered = chunks.map(chunk => ({
            ...chunk,
            keywordScore: calculateTextSimilarity(query, chunk.text)
        }))
        .filter(chunk => chunk.keywordScore > 0.1) // Filter out chunks with very low keyword match
        .sort((a, b) => b.keywordScore - a.keywordScore)
        .slice(0, Math.min(10, chunks.length)); // Take top 10 for AI ranking

        console.log(`[findRelevantChunks] Filtered to ${keywordFiltered.length} chunks using keyword matching`);

        if (keywordFiltered.length === 0) {
            // If no keyword matches, fall back to first few chunks
            console.log(`[findRelevantChunks] No keyword matches found, returning first ${Math.min(topK, chunks.length)} chunks`);
            return chunks.slice(0, Math.min(topK, chunks.length)).map(chunk => ({
                ...chunk,
                relevanceScore: 0.1,
                reason: 'fallback - no keyword matches'
            }));
        }

        // Stage 2: AI-powered ranking for the filtered chunks
        const rankedChunks = [];
        
        for (const chunk of keywordFiltered.slice(0, 6)) { // Limit to 6 for AI processing
            try {
                const prompt = `Rate the relevance of the following text chunk to this question: "${query}"
                
Text chunk: "${chunk.text.substring(0, 800)}..."

Rate from 0-10 where:
- 10: Directly answers the question or contains key information
- 7-9: Highly relevant, contains related information
- 4-6: Somewhat relevant, contains background information
- 1-3: Minimally relevant
- 0: Not relevant

Respond with only a number (0-10) and a brief reason in this format: "Score: X, Reason: brief explanation"`;

                const result = await model.generateContent(prompt);
                const response = result.response.text().trim();
                
                // Parse the AI response
                const scoreMatch = response.match(/Score:\s*(\d+)/i);
                const reasonMatch = response.match(/Reason:\s*(.+)/i);
                
                const aiScore = scoreMatch ? parseInt(scoreMatch[1]) / 10 : chunk.keywordScore;
                const reason = reasonMatch ? reasonMatch[1].trim() : 'AI analysis';
                
                rankedChunks.push({
                    ...chunk,
                    relevanceScore: Math.max(aiScore, chunk.keywordScore), // Use the higher of AI or keyword score
                    reason: reason,
                    aiScore: aiScore,
                    keywordScore: chunk.keywordScore
                });
                
            } catch (aiError) {
                console.warn(`[findRelevantChunks] AI ranking failed for chunk, using keyword score:`, aiError.message);
                rankedChunks.push({
                    ...chunk,
                    relevanceScore: chunk.keywordScore,
                    reason: 'keyword matching (AI unavailable)',
                    aiScore: null,
                    keywordScore: chunk.keywordScore
                });
            }
        }
        
        // Sort by relevance score and return top K
        const topChunks = rankedChunks
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, topK);

        console.log(`[findRelevantChunks] Returning ${topChunks.length} most relevant chunks`);
        console.log(`[findRelevantChunks] Top chunk scores:`, topChunks.map(c => ({ 
            score: c.relevanceScore?.toFixed(2), 
            reason: c.reason,
            preview: c.text.substring(0, 100) + '...'
        })));

        return topChunks;

    } catch (error) {
        console.error('[findRelevantChunks] Error in relevance ranking:', error);
        // Fallback to simple keyword matching
        const fallbackChunks = chunks
            .map(chunk => ({
                ...chunk,
                relevanceScore: calculateTextSimilarity(query, chunk.text),
                reason: 'keyword matching (fallback)'
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, topK);
            
        console.log(`[findRelevantChunks] Using fallback keyword matching, returning ${fallbackChunks.length} chunks`);
        return fallbackChunks;
    }
};

/**
 * Get relevant context for a question from chunked text
 * @param {string} query - The question/query
 * @param {string} fullText - The full PDF text content
 * @param {Object} options - Options for chunking and retrieval
 * @returns {Object} Object containing relevant chunks and context
 */
export const getRelevantContext = async (query, fullText, options = {}) => {
    const {
        maxChunkSize = 2000,
        overlap = 200,
        topK = 3,
        maxContextLength = 6000
    } = options;

    console.log(`[getRelevantContext] Processing query: "${query}" against text of length ${fullText.length}`);

    // Step 1: Chunk the text
    const chunks = chunkText(fullText, maxChunkSize, overlap);
    
    if (chunks.length === 0) {
        return {
            relevantChunks: [],
            contextText: '',
            metadata: {
                totalChunks: 0,
                selectedChunks: 0,
                contextLength: 0
            }
        };
    }

    // Step 2: Find relevant chunks
    const relevantChunks = await findRelevantChunks(query, chunks, topK);
    
    // Step 3: Combine relevant chunks into context
    let contextText = '';
    let currentLength = 0;
    const selectedChunks = [];

    for (const chunk of relevantChunks) {
        const chunkText = `\n--- Relevant Section ---\n${chunk.text}\n`;
        
        if (currentLength + chunkText.length <= maxContextLength) {
            contextText += chunkText;
            currentLength += chunkText.length;
            selectedChunks.push(chunk);
        } else {
            // Try to fit a partial chunk if possible
            const remainingSpace = maxContextLength - currentLength;
            if (remainingSpace > 200) { // Only if we have reasonable space left
                const partialChunk = `\n--- Relevant Section (Partial) ---\n${chunk.text.substring(0, remainingSpace - 50)}...\n`;
                contextText += partialChunk;
                selectedChunks.push({
                    ...chunk,
                    text: chunk.text.substring(0, remainingSpace - 50) + '...',
                    isPartial: true
                });
            }
            break;
        }
    }

    const result = {
        relevantChunks: selectedChunks,
        contextText: contextText.trim(),
        metadata: {
            totalChunks: chunks.length,
            selectedChunks: selectedChunks.length,
            contextLength: contextText.length,
            averageRelevanceScore: selectedChunks.length > 0 
                ? selectedChunks.reduce((sum, chunk) => sum + (chunk.relevanceScore || 0), 0) / selectedChunks.length 
                : 0
        }
    };

    console.log(`[getRelevantContext] Generated context with ${result.metadata.selectedChunks} chunks, ${result.metadata.contextLength} characters`);
    
    return result;
};

/**
 * Pre-process and chunk PDF content for storage
 * @param {string} pdfText - The full PDF text content
 * @param {Object} options - Chunking options
 * @returns {Array} Array of processed chunks
 */
export const preprocessPDFContent = (pdfText, options = {}) => {
    const {
        maxChunkSize = 2000,
        overlap = 200,
        includeMetadata = true
    } = options;

    const chunks = chunkText(pdfText, maxChunkSize, overlap);
    
    if (includeMetadata) {
        return chunks.map((chunk, index) => ({
            ...chunk,
            chunkId: index,
            wordCount: chunk.text.split(/\s+/).length,
            hasNumbers: /\d+/.test(chunk.text),
            hasFormulas: /[=+\-*/]/.test(chunk.text),
            sentences: chunk.text.split(/[.!?]+/).length,
            createdAt: new Date()
        }));
    }

    return chunks;
};
