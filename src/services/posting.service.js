import apiClient from './api';

export const postingService = {
    getAllPostings: async (page = 1, limit = 20) => {
        const response = await apiClient.get('/postings', {
            params: { page, limit }
        });
        return response.data;
    },

    getPostingById: async (id) => {
        const response = await apiClient.get(`/postings/${id}`);
        return response.data;
    },

    createPosting: async (data) => {
        const response = await apiClient.post('/postings', data);
        return response.data;
    },

    updatePosting: async (id, data) => {
        const response = await apiClient.put(`/postings/${id}`, data);
        return response.data;
    },

    deletePosting: async (id) => {
        await apiClient.delete(`/postings/${id}`);
    }
};
