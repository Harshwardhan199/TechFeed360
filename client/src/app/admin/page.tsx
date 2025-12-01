'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import api from '@/services/api';
import { Check, X, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
    const { user, token, logout } = useAuthStore();
    const router = useRouter();
    const [pendingArticles, setPendingArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchPending = async () => {
            try {
                const res = await api.get('/articles/pending');
                console.log(res);
                console.log(res.data.length);

                setPendingArticles(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPending();
    }, [token, router]);

    const handleStatusUpdate = async (id: string, status: 'published' | 'rejected') => {
        try {
            await api.updateStatus(id, status);
            setPendingArticles(pendingArticles.filter((a: any) => a._id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-600">Welcome, {user.username}</span>
                        <button onClick={logout} className="text-red-600 hover:text-red-700 font-medium">Logout</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800">Pending Articles ({pendingArticles.length})</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading...</div>
                    ) : pendingArticles.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No pending articles.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pendingArticles.map((article: any) => (
                                <div key={article._id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">{article.domain || 'Tech'}</span>
                                            <span className="text-slate-400 text-xs">{new Date(article.createdAt).toLocaleString()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{article.title}</h3>
                                        <p className="text-slate-600 text-sm mb-3 line-clamp-2">{article.summary}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span>Source: {article.source}</span>
                                            <a href={article.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                Original <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 min-w-[140px]">
                                        <button
                                            onClick={() => handleStatusUpdate(article._id, 'published')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Check size={16} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(article._id, 'rejected')}
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
