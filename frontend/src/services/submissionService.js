import api from './api';

export const submissionService = {

    submit: async (problemId, language, code) => {
        const response = await api.post('/submissions', {
            problemId,
            language,
            code,
        });
        return response.data;
    },

    run: async (problemId, language, code) => {
        const response = await api.post('/submissions/run', {
            problemId,
            language,
            code,
        });
        return response.data;
    },

    getSubmissionById: async (id) => {
        const response = await api.get(`/submissions/${id}`);
        return response.data;
    },

    getMySubmissions: async (page = 0, size = 10) => {
        const response = await api.get(
            `/submissions/my?page=${page}&size=${size}`);
        return response.data;
    },

    getMySubmissionsForProblem: async (problemId) => {
        const response = await api.get(
            `/submissions/problem/${problemId}`);
        return response.data;
    },
};