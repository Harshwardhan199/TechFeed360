'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import api from '@/services/api';
import ArticleCard from '@/components/ArticleCard';

export default function SearchPage() {
    const [keyword, setKeyword] = useState('');
    const [articles, setArticles] = useState([]);
    const [buffer, setBuffer] = useState([]);
    const [loading, setLoading] = useState(false);

    const initialLoadDone = useRef(false);

    const fetchArticles = async (searchTerm: string) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/articles?keyword=${searchTerm}`);
            setBuffer(data.articles);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Smooth transition: only commit new articles after fetch ends
    useEffect(() => {
        if (!loading) {
            startTransition(() => {
                setArticles(buffer);
            });
        }
    }, [loading, buffer]);

    // Debounce input
    useEffect(() => {
        if (!initialLoadDone.current) return;

        const debounced = setTimeout(() => fetchArticles(keyword), 350);
        return () => clearTimeout(debounced);
    }, [keyword]);

    // First load
    useEffect(() => {
        initialLoadDone.current = true;
        fetchArticles('');
    }, []);

    const Skeleton = () => (
        <div className="shimmer rounded-xl h-44 w-full" />
    );

    return (
        <main className="container mx-auto px-4 py-8 relative">

            {/* Small spinner instead of full overlay → no blink */}
            {loading && (
                <div className="absolute top-4 right-4 z-20">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent animate-spin rounded-full"></div>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-8">Search Articles</h1>

            <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search for tech news..."
                className="w-full border p-2 rounded mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300"
                style={{ opacity: loading ? 0.5 : 1 }}
            >
                {articles.length === 0 && loading ? (
                    [...Array(6)].map((_, i) => <Skeleton key={i} />)
                ) : (
                    articles.map((article: any) => (
                        <div key={article._id} className="fade-in">
                            <ArticleCard article={article} />
                        </div>
                    ))
                )}
            </div>

            {!loading && articles.length === 0 && keyword && (
                <p className="text-center text-gray-500 mt-6 fade-in">
                    No articles found.
                </p>
            )}
        </main>
    );
}
