'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { Menu, X, Search, User } from 'lucide-react';

export default function Navbar() {
    const { user, logout, checkAuth } = useAuthStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        checkAuth();
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [checkAuth]);

    return (
        <nav className={`sticky top-0 left-0 right-0 py-5 z-50 transition-all duration-300 ${isScrolled ? 'glass shadow-md' : 'bg-transparent'}`}>
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <span className="bg-blue-600 text-white p-1 rounded-lg">TF</span>
                    <span className="text-slate-800">TechFeed360</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
                    <Link href="/search" className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1">
                        <Search size={18} /> Search
                    </Link>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Admin</Link>
                            <button onClick={logout} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg p-4 flex flex-col space-y-4 animate-in slide-in-from-top-5">
                    <Link href="/" className="text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/search" className="text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Search</Link>
                    {user ? (
                        <>
                            <Link href="/admin" className="text-slate-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-red-600 font-medium">Logout</button>
                        </>
                    ) : (
                        <Link href="/auth/login" className="text-blue-600 font-medium" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    )}
                </div>
            )}
        </nav>
    );
}
