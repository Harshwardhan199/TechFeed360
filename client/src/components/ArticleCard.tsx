import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';

export interface Article {
    _id: string;
    title: string;
    slug: string;
    summary: string;
    source: string;
    published_at: string;
    image?: string;
    category?: { name: string; slug: string };
    domain?: string;
}

export default function ArticleCard({ article }: { article: Article }) {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div className="relative h-48 bg-slate-200 overflow-hidden">
                {article.image ? (
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                        <span className="text-4xl font-bold opacity-20">TF</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md shadow-sm text-slate-700">
                        {article.source}
                    </span>
                    {article.domain && (
                        <span className="bg-blue-600/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md shadow-sm text-white">
                            {article.domain}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 font-medium">
                    <span>{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
                    {article.category && (
                        <>
                            <span>•</span>
                            <span className="text-blue-600">{article.category.name}</span>
                        </>
                    )}
                </div>

                <Link href={`/article/${article.slug}`} className="group-hover:text-blue-600 transition-colors">
                    <h2 className="text-lg font-bold leading-tight mb-3 line-clamp-2">{article.title}</h2>
                </Link>

                <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">{article.summary}</p>

                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                    <Link href={`/article/${article.slug}`} className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                        Read More <ArrowUpRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
