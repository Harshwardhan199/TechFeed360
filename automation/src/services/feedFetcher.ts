import Parser from 'rss-parser';
import axios from 'axios';
import crypto from 'crypto';

// -----------------------
//  FEEDS ORGANIZED BY CATEGORY
// -----------------------
export const RSS_SOURCES: Record<string, string[]> = {
    ai: [
        'https://www.technologyreview.com/feed/',
        'https://venturebeat.com/category/ai/feed/',
        'https://www.marktechpost.com/feed/',
    ],

    hardware: [
        'https://www.tomshardware.com/feeds/all',
        'https://www.anandtech.com/rss',
        'https://www.techpowerup.com/rss/',
    ],

    gaming: [
        'https://www.ign.com/articles/feed',
        'https://kotaku.com/rss',
        'https://www.gamespot.com/feeds/news/',
    ],

    software: [
        'https://www.omgubuntu.co.uk/feed',
        'https://thenextweb.com/feed/',
        'https://blogs.microsoft.com/feed/',
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
    ],
};

// -----------------------
//  TEST MODE (limit items)
// -----------------------
const TEST_MODE = true;
const TEST_ITEM_LIMIT = 2; // items per feed
const TEST_TOTAL_LIMIT = 10; // total items overall

const RSS_FEEDS: string[] = (
    TEST_MODE
        ? Object.values(RSS_SOURCES).map(list => list[0])
        : Object.values(RSS_SOURCES).flat()
).filter(Boolean) as string[];

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

            // 👉 Limit per feed in test mode
            if (TEST_MODE) {
                items = items.slice(0, TEST_ITEM_LIMIT);
            }

            allItems.push(...items);

        } catch (error: any) {
            console.error(`❌ Feed error (${feedUrl}):`, error?.message);
        }
    }

    // 👉 Global limit
    if (TEST_MODE) {
        allItems = allItems.slice(0, TEST_TOTAL_LIMIT);
    }

    console.log(`✅ Total fetched items: ${allItems.length}`);
    return allItems;
};


// import Parser from 'rss-parser';
// import axios from 'axios';
// import crypto from 'crypto';

// // -----------------------
// //  FEEDS ORGANIZED BY CATEGORY
// // -----------------------
// export const RSS_SOURCES: Record<string, string[]> = {
//     ai: [
//         'https://www.technologyreview.com/feed/',
//         'https://venturebeat.com/category/ai/feed/',
//         'https://www.marktechpost.com/feed/',
//     ],

//     hardware: [
//         'https://www.tomshardware.com/feeds/all',
//         'https://www.anandtech.com/rss',
//         'https://www.techpowerup.com/rss/',
//     ],

//     gaming: [
//         'https://www.ign.com/articles/feed',
//         'https://kotaku.com/rss',
//         'https://www.gamespot.com/feeds/news/',
//     ],

//     software: [
//         'https://www.omgubuntu.co.uk/feed',
//         'https://thenextweb.com/feed/',
//         'https://blogs.microsoft.com/feed/',
//     ],

//     trends: [
//         'https://singularityhub.com/feed/',
//         'https://www.futurism.com/feed',
//         'https://www.space.com/feeds/all',
//     ],

//     bigTech: [
//         'https://www.apple.com/newsroom/rss-feed.rss',
//         'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
//         'https://about.fb.com/news/feed/',
//     ],
// };

// // -----------------------
// //  TEST MODE (only 1 source per category)
// // -----------------------
// const TEST_MODE = true;

// const RSS_FEEDS: string[] = (
//     TEST_MODE
//         ? Object.values(RSS_SOURCES).map(list => list[0])
//         : Object.values(RSS_SOURCES).flat()
// ).filter(Boolean) as string[];

// // -----------------------
// //  Parser with custom headers (fixes blocked feeds)
// // -----------------------
// const parser = new Parser({
//     headers: {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
//         "Accept": "text/html,application/xhtml+xml",
//     }
// });

// // -----------------------
// //  AXIOS RAW FETCH FALLBACK
// // -----------------------
// async function fetchRawFeed(url: string) {
//     try {
//         const response = await axios.get(url, {
//             timeout: 15000,
//             headers: {
//                 "User-Agent": "Mozilla/5.0",
//                 "Accept": "application/xml,text/xml,text/html",
//             },
//         });
//         return response.data;
//     } catch (e) {
//         return null;
//     }
// }

// // -----------------------
// //  MAIN FEED FETCH FUNCTION
// // -----------------------
// export const fetchFeeds = async () => {
//     console.log("📡 Fetching feeds...");

//     let allItems: any[] = [];

//     for (const feedUrl of RSS_FEEDS) {
//         try {
//             console.log(`➡ Fetching: ${feedUrl}`);

//             // 1️⃣ Try axios first
//             let xml = await fetchRawFeed(feedUrl);
//             let feed;

//             if (xml) {
//                 feed = await parser.parseString(xml);
//             } else {
//                 // 2️⃣ Fallback to parseURL
//                 feed = await parser.parseURL(feedUrl);
//             }

//             // 3️⃣ Extract items
//             const items = feed.items.map(item => ({
//                 raw_title: item.title,
//                 raw_content:
//                     item.contentSnippet ||
//                     item["content:encoded"] ||
//                     item.content ||
//                     "",
//                 source: feed.title || "Unknown Source",
//                 original_link: item.link,
//                 pubDate: item.pubDate,
//                 hash: crypto
//                     .createHash("sha256")
//                     .update(item.link || item.title || "")
//                     .digest("hex"),
//             }));

//             allItems.push(...items);

//         } catch (error: any) {
//             console.error(`❌ Feed error (${feedUrl}):`, error?.message);
//         }
//     }

//     console.log(`✅ Total fetched items: ${allItems.length}`);
//     return allItems;
// };


// import Parser from 'rss-parser';
// import crypto from 'crypto';

// const parser = new Parser();

// const RSS_FEEDS = [
//     'https://www.theverge.com/rss/index.xml', //
//     'https://techcrunch.com/feed/',
//     'https://www.wired.com/feed/rss',
//     'https://www.engadget.com/rss.xml',
//     'https://arstechnica.com/feed/', //
//     'https://venturebeat.com/feed/', //
//     'https://9to5mac.com/feed/',  //
//     'https://www.androidauthority.com/feed/',
// ];

// export const fetchFeeds = async () => {
//     console.log('Fetching feeds from multiple sources...');
//     let allItems: any[] = [];

//     for (const feedUrl of RSS_FEEDS) {
//         try {
//             console.log(`Fetching ${feedUrl}...`);
//             const feed = await parser.parseURL(feedUrl);

//             const items = feed.items.map(item => {
//                 const hash = crypto.createHash('sha256').update(item.link || item.title || '').digest('hex');
//                 return {
//                     raw_title: item.title,
//                     raw_content: item.contentSnippet || item.content || '',
//                     source: feed.title || 'Unknown Source',
//                     original_link: item.link,
//                     pubDate: item.pubDate,
//                     hash: hash
//                 };
//             });

//             allItems = [...allItems, ...items];
//         } catch (error) {
//             console.error(`Error fetching ${feedUrl}:`, error);
//         }
//     }

//     console.log(`Fetched ${allItems.length} total items.`);
//     return allItems;
// };
