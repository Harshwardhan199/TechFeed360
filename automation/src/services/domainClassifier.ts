export const DOMAINS = {
    AI: ['ai', 'artificial intelligence', 'llm', 'gpt', 'openai', 'machine learning', 'neural network', 'deepmind', 'anthropic', 'claude', 'gemini', 'llama'],
    HARDWARE: ['cpu', 'gpu', 'nvidia', 'amd', 'intel', 'chip', 'processor', 'hardware', 'device', 'phone', 'laptop', 'samsung', 'iphone', 'pixel'],
    GAMING: ['game', 'gaming', 'esports', 'console', 'playstation', 'xbox', 'nintendo', 'steam', 'epic games', 'unity', 'unreal engine'],
    SOFTWARE: ['software', 'app', 'ios', 'android', 'windows', 'macos', 'linux', 'developer', 'coding', 'programming', 'github', 'gitlab'],
    BIG_TECH: ['apple', 'google', 'microsoft', 'meta', 'amazon', 'tesla', 'facebook', 'twitter', 'x.com', 'layoff', 'lawsuit', 'acquisition'],
    TRENDS: ['trend', 'future', 'market', 'analysis', 'prediction', 'adoption', 'emerging', 'crypto', 'blockchain', 'metaverse', 'web3']
};

export const classifyDomain = (title: string, content: string): string => {
    const text = (title + ' ' + content).toLowerCase();

    let maxScore = 0;
    let bestDomain = 'Trends'; // Default

    for (const [domain, keywords] of Object.entries(DOMAINS)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                score++;
            }
        }

        // Weight Big Tech higher if specific keywords are present
        if (domain === 'BIG_TECH' && score > 0) {
            score *= 1.2;
        }

        if (score > maxScore) {
            maxScore = score;
            bestDomain = domain === 'BIG_TECH' ? 'Big Tech Buzz' : domain.charAt(0) + domain.slice(1).toLowerCase();
        }
    }

    return bestDomain;
};
