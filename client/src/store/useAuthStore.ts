import { create } from 'zustand';
import api from '@/services/api';

interface User {
    _id: string;
    username: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (credentials: any) => Promise<void>;
    register: (credentials: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('token', data.token);
        set({ user: data, token: data.token });
    },
    register: async (credentials) => {
        const { data } = await api.post('/auth/register', credentials);
        localStorage.setItem('token', data.token);
        set({ user: data, token: data.token });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
    checkAuth: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                set({ token });
            }
        }
    }
}));

export default useAuthStore;