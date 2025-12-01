import Groq from 'groq-sdk';

let groqInstance: Groq | null = null;

const getGroqClient = () => {
    if (!groqInstance) {
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqInstance;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateCompletion = async (prompt: string, systemPrompt: string = 'You are a helpful assistant.', retries = 3): Promise<string> => {
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
    } catch (error: any) {
        if (error?.status === 429 && retries > 0) {
            const retryAfter = error?.headers?.['retry-after'];
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 60s if no header
            console.warn(`Rate limit hit. Retrying in ${waitTime / 1000}s... (${retries} retries left)`);
            await sleep(waitTime);
            return generateCompletion(prompt, systemPrompt, retries - 1);
        }

        console.error('Groq API Error:', error);
        throw error;
    }
};
