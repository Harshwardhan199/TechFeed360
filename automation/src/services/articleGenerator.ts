import { fetchFeeds } from './feedFetcher';
import { clusterItems } from './clusterFeeds';
import { classifyDomain } from './domainClassifier';
import { generateCompletion } from './groqClient';
import { fetchOGImage } from './ogFetcher';
import Article from '../models/Article';

export const generateArticles = async () => {
    console.log('Starting automation pipeline...');

    // 1. Fetch Feeds
    const allItems = await fetchFeeds();

    // 2. Cluster Items
    const clusters = clusterItems(allItems);
    console.log(`Grouped ${allItems.length} items into ${clusters.length} clusters.`);

    for (const cluster of clusters) {
        try {
            const mainItem = cluster.items[0];

            // Check if article with this hash already exists (avoid duplicates)
            const existingArticle = await Article.findOne({ hash: mainItem.hash });
            if (existingArticle) {
                console.log(`Skipping duplicate: ${mainItem.raw_title}`);
                continue;
            }

            const domain = classifyDomain(mainItem.raw_title, mainItem.raw_content || '');

            // Prepare context from cluster items
            const context = cluster.items.map(item => `Title: ${item.raw_title}\nContent: ${item.raw_content}\nSource: ${item.source}`).join('\n\n');

            // const prompt = `
            // You are an expert tech journalist writing for a top-tier publication.
            // Write a news article strictly based on the provided sources.

            // MODEL RULES (MUST FOLLOW):
            // 1. Use ONLY information found in the Sources. If something is missing, say nothing about it.
            // 2. Do NOT hallucinate numbers, quotes, dates, or claims.
            // 3. Re-write the information; do not copy exact sentences from the sources.
            // 4. Maintain a neutral, factual, journalistic tone.
            // 5. The output MUST be valid JSON. 
            // 6. Do NOT include any text outside the JSON.
            // 7. Inside the JSON, escape any double quotes used in Markdown.
            // 8. Do NOT use backticks (\`\`\`) anywhere in the article (keeps JSON stable).
            // 9. Ensure the Markdown content is readable **within a JSON string**.

            // Domain: ${domain}

            // Sources:
            // ${context}

            // Return output in the EXACT following JSON structure:

            // {
            // "title": "Engaging, click-worthy title relevant to the domain",
            // "summary": "Concise summary of the article (maximum 200 characters)",
            // "content": "A minimum 300-word Markdown article rewritten in a clear, engaging journalistic style. Do not use backticks. Escape all quotes. Use structured sections if needed.",
            // "key_takeaways": [
            //     "Takeaway 1",
            //     "Takeaway 2",
            //     "Takeaway 3"
            // ],
            // "tags": ["tag1", "tag2", "tag3"]
            // }

            // Generate ONLY the JSON object.
            // `;

            const prompt = `
            You are an expert senior tech journalist who writes in-depth, long-form,
            magazine-quality articles.

            Your task is to write a comprehensive, multi-page (3–4 pages) deep-dive news article
            STRICTLY using the information provided in the Sources.

            HARD RULES (MUST FOLLOW):
            1. Use ONLY the information in the Sources. If something is not in the sources,
            do NOT fabricate, assume, or hallucinate it.
            2. Article length MUST be between 900 and 1600 words.
            3. Include multiple sections with headers to create a multi-page experience:
            - Introduction
            - Background / Context
            - Detailed Breakdown
            - Expert Analysis (source-based)
            - Industry Impact
            - What Happens Next
            4. Maintain a neutral, factual journalistic tone.
            5. Do NOT copy sentences from sources. Rewrite everything.
            6. MUST output valid JSON with NO text outside the JSON.
            7. Inside the JSON:
            - Escape all double quotes.
            - Do NOT use backticks anywhere.
            - Markdown must be clean, readable, and contained inside a JSON string.
            8. No opinions unless supported by the sources.

            Domain: ${domain}

            Sources:
            ${context}

            OUTPUT FORMAT (MANDATORY):

            {
            "title": "Engaging title relevant to the domain",
            "summary": "A concise summary of the article (maximum 200 characters)",
            "content": "A 900-1600 word long-form article in Markdown with multiple sections. No backticks. Escape quotes. Use rich structure and deep analysis.",
            "key_takeaways": [
                "Takeaway 1",
                "Takeaway 2",
                "Takeaway 3"
            ],
            "tags": ["tag1", "tag2", "tag3"]
            }

            Generate ONLY the JSON object.
            `;

            console.log(`Generating article for cluster: ${mainItem.raw_title.substring(0, 30)}...`);
            const jsonResponse = await generateCompletion(prompt);
            const articleData = JSON.parse(jsonResponse);

            // Fetch Image
            const image = await fetchOGImage(mainItem.original_link);

            // Create Article with Pending Status
            const newArticle = new Article({
                title: articleData.title,
                slug: articleData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now(),
                summary: articleData.summary,
                content: articleData.content,
                image: image || '',
                tags: articleData.tags,
                category: null,
                source: 'TechFeed360 AI',
                source_url: mainItem.original_link,
                published_at: new Date(),
                hash: mainItem.hash,
                domain: domain,
                key_takeaways: articleData.key_takeaways,
                original_sources: cluster.items.map(i => i.original_link),
                status: 'pending' // Important: Set status to pending
            });

            await newArticle.save();
            console.log(`Article created (Pending): ${newArticle.title}`);

        } catch (error) {
            console.error('Error processing cluster:', error);
        }
    }
    console.log('Automation pipeline completed.');
};
