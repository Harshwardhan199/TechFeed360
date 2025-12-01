import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Create a wrapper object to add custom methods while still using the axios instance
const apiService = {
    get: api.get,
    post: api.post,
    put: api.put,
    delete: api.delete,
    updateStatus: (id: string, status: string) => api.put(`/articles/${id}/status`, { status }),
};

export default apiService;
