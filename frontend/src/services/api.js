import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8090/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 errors globally
// BUT skip redirect if we are on the login page
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login')
        const isRegisterRequest = error.config?.url?.includes('/auth/register')

        if (error.response?.status === 401
            && !isLoginRequest
            && !isRegisterRequest) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;