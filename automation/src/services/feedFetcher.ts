import Parser from 'rss-parser';
import axios from 'axios';
import crypto from 'crypto';
import Article from '../models/Article';

// -----------------------
//  FEEDS ORGANIZED BY CATEGORY
// -----------------------
export const RSS_SOURCES: Record<string, string[]> = {
    ai: [
        'https://openai.com/blog/rss.xml',
        'https://blog.research.google/atom.xml',
        'https://blogs.microsoft.com/ai/feed/',
        'https://venturebeat.com/category/ai/feed/',
        'https://www.technologyreview.com/feed/',
    ],

    hardware: [
        'https://www.tomshardware.com/feeds/all',
        'https://news.samsung.com/global/feed',
    ],

    gaming: [
        'https://www.gamespot.com/feeds/news/',
        'https://blog.playstation.com/feed/',         // Sony
        'https://store.steampowered.com/feeds/news.xml',
    ],

    software: [
        'https://www.omgubuntu.co.uk/feed',
        'https://thenextweb.com/feed/',
        'https://blogs.microsoft.com/feed/',          // MS general
        'https://ubuntu.com/blog/feed',
        'https://blog.mozilla.org/feed/',
        'https://github.blog/feed/',
    ],

    trends: [
        'https://singularityhub.com/feed/',
        'https://www.futurism.com/feed',
        'https://www.space.com/feeds/all',
    ],

    bigTech: [
        'https://www.apple.com/newsroom/rss-feed.rss',
        'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
        'https://about.fb.com/news/feed/',
        'https://newsroom.spotify.com/feed/',
    ]
};

// -----------------------
//  RSS FEEDS
// -----------------------
const RSS_FEEDS: string[] = (Object.values(RSS_SOURCES).flat()).filter(Boolean) as string[];

// -----------------------
//  Parser with custom headers
// -----------------------
const parser = new Parser({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml",
    }
});

// -----------------------
//  AXIOS RAW FETCH FALLBACK
// -----------------------
async function fetchRawFeed(url: string) {
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "application/xml,text/xml,text/html",
            },
        });
        return response.data;
    } catch (e) {
        return null;
    }
}

// -----------------------
//  MAIN FEED FETCH FUNCTION
// -----------------------
export const fetchFeeds = async () => {
    console.log("📡 Fetching feeds...");

    let allItems: any[] = [];
    const MAX_NEW_ITEMS_PER_FEED = 10;

    for (const feedUrl of RSS_FEEDS) {
        try {
            console.log(`➡ Fetching: ${feedUrl}`);

            // 1️⃣ Try axios first
            let xml = await fetchRawFeed(feedUrl);
            let feed;

            if (xml) {
                feed = await parser.parseString(xml);
            } else {
                // 2️⃣ Fallback to parseURL
                feed = await parser.parseURL(feedUrl);
            }

            // 3️⃣ Extract items
            let items = feed.items.map(item => ({
                raw_title: item.title,
                raw_content:
                    item.contentSnippet ||
                    item["content:encoded"] ||
                    item.content ||
                    "",
                source: feed.title || "Unknown Source",
                original_link: item.link,
                pubDate: item.pubDate,
                hash: crypto
                    .createHash("sha256")
                    .update(item.link || item.title || "")
                    .digest("hex"),
            }));

            console.log(`   ✔ Total items in feed: ${items.length}`);

            // 4️⃣ Remove duplicates (only keep new items not in DB)
            const uniqueNewItems: any[] = [];

            for (const item of items) {
                const exists = await Article.findOne({ hash: item.hash });
                if (!exists) uniqueNewItems.push(item);
            }

            console.log(`   ➕ New unique items: ${uniqueNewItems.length}`);

            // 5️⃣ Limit to latest 10 NEW items
            const finalItems = uniqueNewItems.slice(0, MAX_NEW_ITEMS_PER_FEED);

            console.log(`   📌 Keeping: ${finalItems.length} items`);

            // 6️⃣ Push to global array
            allItems.push(...finalItems);

        } catch (error: any) {
            console.error(`❌ Feed error (${feedUrl}):`, error?.message);
        }
    }

    console.log(`✅ Total NEW items collected across all feeds: ${allItems.length}`);
    return allItems;
};