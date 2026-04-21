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

        if (endIndex < text.length) {
            const searchStart = Math.max(endIndex - 200, startIndex);
            const sentenceEnd = text.lastIndexOf('.', endIndex);
            const paragraphEnd = text.lastIndexOf('\n\n', endIndex);
            const questionEnd = text.lastIndexOf('?', endIndex);
            const exclamationEnd = text.lastIndexOf('!', endIndex);

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

        startIndex = Math.max(endIndex - overlap, startIndex + 1);

        if (startIndex >= endIndex) {
            break;
        }
    }

    console.log(`[chunkText] Created ${chunks.length} chunks`);
    return chunks;
};

/**
 * Calculate text similarity using keyword matching
 * @param {string} query
 * @param {string} text
 * @returns {number} Similarity score (0-1)
 */
const calculateTextSimilarity = (query, text) => {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const textWords = text.toLowerCase().split(/\s+/);

    let matches = 0;
    const totalQueryWords = queryWords.length;

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
 * Find the most relevant chunks for a given query using keyword scoring
 * @param {string} query - The search query
 * @param {Array} chunks - Array of text chunks
 * @param {number} topK - Number of top chunks to return
 * @returns {Array} Array of relevant chunks with scores
 */
export const findRelevantChunks = (query, chunks, topK = 3) => {
    console.log(`[findRelevantChunks] Finding relevant chunks for query: "${query}" from ${chunks.length} chunks`);

    if (!chunks || chunks.length === 0) {
        return [];
    }

    const scored = chunks
        .map(chunk => ({
            ...chunk,
            relevanceScore: calculateTextSimilarity(query, chunk.text),
            reason: 'keyword matching',
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // If no keyword matches at all, return first topK chunks as fallback
    const topChunks = scored[0]?.relevanceScore > 0
        ? scored.filter(c => c.relevanceScore > 0.05).slice(0, topK)
        : scored.slice(0, topK);

    console.log(`[findRelevantChunks] Returning ${topChunks.length} chunks, top score: ${topChunks[0]?.relevanceScore?.toFixed(2)}`);
    return topChunks;
};

/**
 * Get relevant context for a question from chunked text
 * @param {string} query - The question/query
 * @param {string} fullText - The full PDF text content
 * @param {Object} options - Options for chunking and retrieval
 * @returns {Object} Object containing relevant chunks and context
 */
export const getRelevantContext = (query, fullText, options = {}) => {
    const {
        maxChunkSize = 2000,
        overlap = 200,
        topK = 3,
        maxContextLength = 6000
    } = options;

    console.log(`[getRelevantContext] Processing query: "${query}" against text of length ${fullText.length}`);

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

    const relevantChunks = findRelevantChunks(query, chunks, topK);

    let contextText = '';
    let currentLength = 0;
    const selectedChunks = [];

    for (const chunk of relevantChunks) {
        const section = `\n--- Relevant Section ---\n${chunk.text}\n`;

        if (currentLength + section.length <= maxContextLength) {
            contextText += section;
            currentLength += section.length;
            selectedChunks.push(chunk);
        } else {
            const remainingSpace = maxContextLength - currentLength;
            if (remainingSpace > 200) {
                contextText += `\n--- Relevant Section (Partial) ---\n${chunk.text.substring(0, remainingSpace - 50)}...\n`;
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
