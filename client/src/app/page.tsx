import api from '@/services/api';
import ArticleCard, { Article } from '@/components/ArticleCard';
import HeroSection from '@/components/HeroSection';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Helper component for domain sections
const DomainSection = ({ title, articles, color = "blue" }: { title: string, articles: Article[], color?: string }) => {
  if (articles.length === 0) return null;
  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className={`h-8 w-1 bg-${color}-600 rounded-full`}></div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article: Article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
};

async function getArticles() {
  try {
    const { data } = await api.get('/articles?pageNumber=1&pageSize=50');
    console.log(data);

    return data.articles;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export default async function Home() {
  const articles = await getArticles();

  const featuredArticle = articles[0];
  const latestArticles = articles.slice(1, 7);

  const getDomainArticles = (domain: string) => articles.filter((a: Article) => a.domain === domain).slice(0, 3);

  const aiArticles = getDomainArticles('AI');
  const hardwareArticles = getDomainArticles('Hardware');
  const gamingArticles = getDomainArticles('Gaming');
  const softwareArticles = getDomainArticles('Software');
  const trendsArticles = getDomainArticles('Trends');
  const bigTechArticles = getDomainArticles('Big Tech Buzz');

  return (
    <main className="min-h-screen bg-slate-50 pt-10 pb-16">
      <div className="container mx-auto px-4">

        {/* Hero Section */}
        {featuredArticle && <HeroSection article={featuredArticle} />}

        {/* Latest News Grid */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Latest News</h2>
              <p className="text-slate-500 mt-1">Fresh from the tech world</p>
            </div>
            <Link href="/search" className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article: Article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>

        <DomainSection title="Artificial Intelligence" articles={aiArticles} color="purple" />
        <DomainSection title="Hardware & Gear" articles={hardwareArticles} color="red" />
        <DomainSection title="Gaming & Esports" articles={gamingArticles} color="green" />
        <DomainSection title="Software & Apps" articles={softwareArticles} color="blue" />
        <DomainSection title="Future Trends" articles={trendsArticles} color="indigo" />
        <DomainSection title="Big Tech Buzz" articles={bigTechArticles} color="orange" />

        {/* Newsletter / CTA Section */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay Ahead of the Curve</h2>
            <p className="text-slate-300 mb-8 text-lg">Get the latest tech news, reviews, and insights delivered straight to your inbox.</p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <input type="email" placeholder="Enter your email" className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-colors">Subscribe</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
