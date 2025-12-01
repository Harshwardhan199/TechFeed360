'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import { format } from 'date-fns';
import { marked } from "marked";

export default function ArticlePage() {
    const { slug } = useParams();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchArticle = async () => {
            try {
                const { data } = await api.get(`/articles/${slug}`);

                // Remove leading 2–4 spaces on each line
                const normalizedContent = (data.content || "").replace(/^\s{1,4}/gm, "");

                let htmlContent = await marked.parse(normalizedContent);

                htmlContent = htmlContent.replace(/<h1>/g, "<h2>").replace(/<\/h1>/g, "</h2>");

                setArticle({
                    ...data,
                    html_content: htmlContent,
                });

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!article) return <div className="p-8 text-center">Article not found</div>;

    return (
        <main className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex items-center text-gray-500 mb-8 space-x-4">
                <span>{article.source}</span>
                <span>•</span>
                <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
                {article.category && (
                    <>
                        <span>•</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">{article.category.name}</span>
                    </>
                )}
                {article.domain && (
                    <>
                        <span>•</span>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">{article.domain}</span>
                    </>
                )}
            </div>

            {article.image && (
                <img src={article.image} alt={article.title} className="w-full h-auto rounded-lg mb-8" />
            )}

            <div
                className="article-content prose prose-lg max-w-none mb-12 break-words whitespace-normal"
                dangerouslySetInnerHTML={{ __html: article.html_content }}
            />

            {/* <div className="prose lg:prose-xl max-w-none mb-12" dangerouslySetInnerHTML={{ __html: article.content }}></div> */}

            {article.key_takeaways && article.key_takeaways.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-xl mb-8">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Key Takeaways</h3>
                    <ul className="list-disc list-inside space-y-2 text-blue-800">
                        {article.key_takeaways.map((takeaway: string, index: number) => (
                            <li key={index}>{takeaway}</li>
                        ))}
                    </ul>
                </div>
            )}

            {article.original_sources && article.original_sources.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Sources</h4>
                    <ul className="space-y-2">
                        {article.original_sources.map((source: string, index: number) => (
                            <li key={index}>
                                <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate block">
                                    {source}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* <div className="mt-8 pt-8 border-t">
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Read original article on {article.source}
                </a>
            </div> */}
        </main>
    );
}
