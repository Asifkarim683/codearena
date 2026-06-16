import api from './api';
import axios from 'axios';

// Public submit - use plain axios (no auth needed)
const publicApi = axios.create({
    baseURL: 'http://localhost:8090/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

export const supportService = {

    submitTicket: async (name, email, subject, message) => {
        const response = await publicApi.post('/support', {
            name, email, subject, message,
        });
        return response.data;
    },

    getAllTickets: async (page = 0, size = 10, status = 'ALL') => {
        const response = await api.get(
            `/support/admin?page=${page}&size=${size}&status=${status}`);
        return response.data;
    },

    resolveTicket: async (id) => {
        const response = await api.put(`/support/admin/${id}/resolve`);
        return response.data;
    },

    getOpenCount: async () => {
        const response = await api.get('/support/admin/count');
        return response.data;
    },
};