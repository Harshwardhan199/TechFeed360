'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuthStore();
    const router = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ username, password, role: 'admin' });
            router.push('/admin');
        } catch (err: any) {
            setError('Registration failed. Username might be taken.');
        }
    };

    return (
        <main className="container mx-auto px-4 py-8 max-w-md">
            <h1 className="text-3xl font-bold mb-8 text-center">Admin Registration</h1>
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
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                    Register
                </button>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Login here</Link>
                </p>
            </form>
        </main>
    );
}
