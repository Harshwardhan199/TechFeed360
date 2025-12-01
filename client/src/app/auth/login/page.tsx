'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('Harsh');
    const [password, setPassword] = useState('1234');
    const { login } = useAuthStore();
    const router = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ username, password });
            router.push('/admin');
        } catch (err: any) {
            setError('Invalid credentials');
        }
    };

    return (
        <main className="container mx-auto px-4 py-8 max-w-md">
            <h1 className="text-3xl font-bold mb-8 text-center">Admin Login</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Login
                </button>
                <p className="mt-4 text-center text-sm">
                    Need an account? <Link href="/auth/register" className="text-blue-600 hover:underline">Register here</Link>
                </p>
            </form>
        </main>
    );
}
