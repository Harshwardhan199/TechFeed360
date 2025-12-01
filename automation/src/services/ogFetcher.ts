import ogs from 'open-graph-scraper';

export const fetchOGImage = async (url: string): Promise<string | null> => {
    try {
        const { result } = await ogs({ url });
        if (result.success && result.ogImage && result.ogImage.length > 0) {
            const image = result.ogImage[0];
            if (image && image.url) {
                return image.url;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error fetching OG image for ${url}:`, error);
        return null;
    }
};
