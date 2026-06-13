import api from './api';

export const contestService = {

    getContests: async () => {
        const response = await api.get('/contests');
        return response.data;
    },

    getContestById: async (id) => {
        const response = await api.get(`/contests/${id}`);
        return response.data;
    },

    createContest: async (data) => {
        const response = await api.post('/contests', data);
        return response.data;
    },

    joinContest: async (id) => {
        const response = await api.post(`/contests/${id}/join`);
        return response.data;
    },

    deleteContest: async (id) => {
        const response = await api.delete(`/contests/${id}`);
        return response.data;
    },

    getScoreboard: async (id) => {
        const response = await api.get(`/contests/${id}/scoreboard`);
        return response.data;
    },
};