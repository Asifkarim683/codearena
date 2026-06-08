import api from './api';

export const problemService = {

    getProblems: async (page = 0, size = 20, difficulty = '', keyword = '') => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (difficulty) params.append('difficulty', difficulty);
        if (keyword) params.append('keyword', keyword);
        const response = await api.get(`/problems?${params}`);
        return response.data;
    },

    getProblemById: async (id) => {
        const response = await api.get(`/problems/${id}`);
        return response.data;
    },

    getTags: async () => {
        const response = await api.get('/problems/tags');
        return response.data;
    },

    createProblem: async (problemData) => {
        const response = await api.post('/problems', problemData);
        return response.data;
    },

    updateProblem: async (id, problemData) => {
        const response = await api.put(`/problems/${id}`, problemData);
        return response.data;
    },

    deleteProblem: async (id) => {
        const response = await api.delete(`/problems/${id}`);
        return response.data;
    },

    addTestCase: async (problemId, testCase) => {
        const response = await api.post(
            `/problems/${problemId}/testcases`, testCase);
        return response.data;
    },
};