import stringSimilarity from 'string-similarity';

interface Cluster {
    cluster_id: string;
    items: any[];
}

export const clusterItems = (items: any[]): Cluster[] => {
    if (items.length === 0) return [];

    const clusters: Cluster[] = [];
    const processedIndices = new Set<number>();

    for (let i = 0; i < items.length; i++) {
        if (processedIndices.has(i)) continue;

        const currentItem = items[i];
        const currentCluster: any[] = [currentItem];
        processedIndices.add(i);

        for (let j = i + 1; j < items.length; j++) {
            if (processedIndices.has(j)) continue;

            const otherItem = items[j];
            const similarity = stringSimilarity.compareTwoStrings(
                currentItem.raw_title || '',
                otherItem.raw_title || ''
            );

            // Threshold for clustering
            if (similarity > 0.5) {
                currentCluster.push(otherItem);
                processedIndices.add(j);
            }
        }

        clusters.push({
            cluster_id: `cluster_${Date.now()}_${i}`,
            items: currentCluster
        });
    }

    return clusters;
};
