import api from './api';

export const adminService = {

    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getUsers: async (page = 0, size = 10) => {
        const response = await api.get(
            `/admin/users?page=${page}&size=${size}`);
        return response.data;
    },

    getSubmissions: async (page = 0, size = 10) => {
        const response = await api.get(
            `/admin/submissions?page=${page}&size=${size}`);
        return response.data;
    },

    deactivateUser: async (id) => {
        const response = await api.put(
            `/admin/users/${id}/deactivate`);
        return response.data;
    },

    activateUser: async (id) => {
        const response = await api.put(
            `/admin/users/${id}/activate`);
        return response.data;
    },

    promoteUser: async (id) => {
        const response = await api.put(
            `/admin/users/${id}/promote`);
        return response.data;
    },
};