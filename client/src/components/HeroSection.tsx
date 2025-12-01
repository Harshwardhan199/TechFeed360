import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface Article {
    _id: string;
    title: string;
    slug: string;
    summary: string;
    source: string;
    published_at: string;
    image?: string;
    category?: { name: string; slug: string };
}

export default function HeroSection({ article }: { article: Article }) {
    if (!article) return null;

    return (
        <section className="relative w-full h-[500px] rounded-3xl overflow-hidden mb-12 group">
            <div className="absolute inset-0">
                {article.image ? (
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Featured
                        </span>
                        <span className="text-slate-300 text-sm font-medium">
                            {format(new Date(article.published_at), 'MMMM d, yyyy')}
                        </span>
                    </div>

                    <Link href={`/article/${article.slug}`}>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight hover:text-blue-400 transition-colors">
                            {article.title}
                        </h1>
                    </Link>

                    <p className="text-slate-300 text-lg mb-6 line-clamp-2 md:line-clamp-3 max-w-2xl">
                        {article.summary}
                    </p>

                    <Link href={`/article/${article.slug}`} className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors">
                        Read Full Story <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
