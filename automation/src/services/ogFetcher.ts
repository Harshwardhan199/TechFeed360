import ogs from 'open-graph-scraper';

export const fetchOGImage = async (url: string): Promise<string | null> => {
    try {
        const { result } = await ogs({
            url,
            fetchOptions: {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            },
            timeout: 10000 // optional
        });

        if (result?.success && Array.isArray(result?.ogImage) && result?.ogImage.length) {
            return result.ogImage[0]?.url || null;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching OG image for ${url}:`, error);
        return null;
    }
};


// import ogs from 'open-graph-scraper';

// export const fetchOGImage = async (url: string): Promise<string | null> => {
//     try {
//         const { result } = await ogs({ url });
//         if (result.success && result.ogImage && result.ogImage.length > 0) {
//             const image = result.ogImage[0];
//             if (image && image.url) {
//                 return image.url;
//             }
//         }
//         return null;
//     } catch (error) {
//         console.error(`Error fetching OG image for ${url}:`, error);
//         return null;
//     }
// };
