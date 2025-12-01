import { fetchFeeds } from './feedFetcher';
import { clusterItems } from './clusterFeeds';
import { classifyDomain } from './domainClassifier';
import { generateCompletion } from './groqClient';
import { fetchOGImage } from './ogFetcher';
import Article from '../models/Article';

// ------------------------------------------------------------------
// 1. HARVEST CANDIDATES (Run every ~30 mins)
//    - Fetches feeds
//    - Clusters them
//    - Saves new clusters as "queued" articles (no AI generation yet)
// ------------------------------------------------------------------
export const harvestCandidates = async () => {
    console.log('🌾 Starting harvest pipeline...');

    // 1. Fetch Feeds
    const allItems = await fetchFeeds();

    // 2. Cluster Items
    const clusters = clusterItems(allItems);
    console.log(`Grouped ${allItems.length} items into ${clusters.length} clusters.`);

    let newCandidates = 0;

    for (const cluster of clusters) {
        try {
            const mainItem = cluster.items[0];

            const domain = classifyDomain(mainItem.raw_title, mainItem.raw_content || '');

            // Create Article with Queued Status
            // We store the cluster context in the content field temporarily or just rely on the fact 
            // that we might need to re-construct it? 
            // Actually, we need to store the cluster items to generate the prompt later.
            // Let's store the raw cluster data in `original_sources` or a new field?
            // The current schema has `original_sources` as string[].
            // We can store the combined text in `content` temporarily since it's not published yet.

            const context = cluster.items.map(item => `Title: ${item.raw_title}\nContent: ${item.raw_content}\nSource: ${item.source}`).join('\n\n');

            const newArticle = new Article({
                title: mainItem.raw_title, // Temporary title
                slug: 'temp-' + mainItem.hash, // Temporary slug
                summary: 'Waiting for generation...',
                content: context, // Store raw context here for the generator to use
                image: '', // Will fetch later
                tags: [],
                category: null,
                source: 'TechFeed360 AI',
                source_url: mainItem.original_link,
                published_at: new Date(),
                hash: mainItem.hash,
                domain: domain,
                key_takeaways: [],
                original_sources: cluster.items.map(i => i.original_link),
                status: 'queued' // <--- IMPORTANT
            });

            await newArticle.save();
            newCandidates++;
            console.log(`Queued candidate: ${newArticle.title}`);

        } catch (error) {
            console.error('Error processing cluster:', error);
        }
    }
    console.log(`Harvest completed. Added ${newCandidates} new candidates.`);
};

// ------------------------------------------------------------------
// 2. PROCESS QUEUE (Run every ~10 mins)
//    - Picks ONE "queued" article
//    - Generates AI content
//    - Fetches Image
//    - Updates to "pending"
// ------------------------------------------------------------------
export const processQueue = async () => {
    console.log('⚙️ Processing queue...');

    // Find one queued article (oldest first)
    const candidate = await Article.findOne({ status: 'queued' }).sort({ createdAt: 1 });

    if (!candidate) {
        console.log('Queue is empty. Nothing to process.');
        return;
    }

    console.log(`Processing candidate: ${candidate.title}`);

    try {
        const context = candidate.content; // We stored raw context here
        const domain = candidate.domain;

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

        console.log(`Generating AI content for: ${candidate.title.substring(0, 30)}...`);
        const jsonResponse = await generateCompletion(prompt);
        const articleData = JSON.parse(jsonResponse);

        // Fetch Image
        const image = await fetchOGImage(candidate.source_url || '');

        // Update the article
        candidate.title = articleData.title;
        candidate.slug = articleData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
        candidate.summary = articleData.summary;
        candidate.content = articleData.content; // Overwrite raw context with actual content
        candidate.image = image || '';
        candidate.tags = articleData.tags;
        candidate.key_takeaways = articleData.key_takeaways;
        candidate.status = 'published'; // Published

        await candidate.save();
        console.log(`✅ Article generated & updated to Published: ${candidate.title}`);

    } catch (error) {
        console.error(`❌ Error processing candidate ${candidate._id}:`, error);
        // Optional: Increment retry count or mark as failed if it fails too many times
        // For now, we leave it as queued or could move to 'failed' to avoid blocking the queue
        // Let's move to 'failed' if we had that status, but for now maybe just log it.
        // If we don't change status, it will retry forever.
        // Let's delete it or mark it as 'pending' with error?
        // Safer: Delete it so it doesn't block.
        // await Article.findByIdAndDelete(candidate._id);
        // console.log('Removed failed candidate from queue.');
    }
};

// Deprecated single function (kept for reference if needed, but we won't use it)
export const generateArticles = async () => {
    await harvestCandidates();
    await processQueue();
};
