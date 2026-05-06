const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const getApiKey = () => {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY not set');
    return key;
};

/**
 * Generate text via Groq API (OpenAI-compatible).
 * @param {string} instruction - The instruction/prompt text
 * @param {number} maxTokens - Max tokens to generate
 * @returns {Promise<string>} Generated text
 */
export const generateText = async (instruction, maxTokens = 1024) => {
    const apiKey = getApiKey();

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: 'user', content: instruction }],
            max_tokens: maxTokens,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error('Groq API returned empty response');
    }

    return text.trim();
};

/**
 * Stream text from Groq via SSE. Returns the raw fetch Response so callers
 * can pipe the body stream directly.
 */
export const generateTextStream = async (instruction, maxTokens = 1024) => {
    const apiKey = getApiKey();

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: 'user', content: instruction }],
            max_tokens: maxTokens,
            temperature: 0.7,
            stream: true,
        }),
    });

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errBody}`);
    }

    return response;
};

/**
 * Extract 3-6 topic tags from document text. Returns [] on any failure.
 */
export const generateTags = async (textContent) => {
    try {
        const snippet = textContent.slice(0, 3000);
        const prompt = `Extract 3-6 relevant topic tags from this document. Return ONLY a valid JSON array of lowercase hyphenated strings, no explanation, no markdown. Example: ["machine-learning","neural-networks"]\n\nDOCUMENT:\n${snippet}`;
        const raw = await generateText(prompt, 200);
        const match = raw.match(/\[.*?\]/s);
        if (!match) return [];
        const tags = JSON.parse(match[0]);
        if (!Array.isArray(tags)) return [];
        return tags.filter(t => typeof t === 'string').slice(0, 8);
    } catch {
        return [];
    }
};
