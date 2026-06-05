import api from './api';

export const authService = {

    register: async (username, email, password) => {
        const response = await api.post('/auth/register', {
            username,
            email,
            password,
        });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        const { data } = response.data;
        // Save token and user to localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data));
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('accessToken');
    },

    isAdmin: () => {
        const user = localStorage.getItem('user');
        if (!user) return false;
        return JSON.parse(user).role === 'ADMIN';
    },
};