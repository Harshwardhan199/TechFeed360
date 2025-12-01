import Groq from 'groq-sdk';

let groqInstance: Groq | null = null;

const getGroqClient = () => {
    if (!groqInstance) {
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqInstance;
};

export const generateCompletion = async (prompt: string, systemPrompt: string = 'You are a helpful assistant.') => {
    try {
        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: 'json_object' },
        });

        return completion.choices[0]?.message?.content || '{}';
    } catch (error) {
        console.error('Groq API Error:', error);
        throw error;
    }
};
