import axios from 'axios';
import { API_URL } from '../config';

export const assetService = {
    uploadAssets: async (files, postId) => {
        const formData = new FormData();

        files.forEach(file => {
            formData.append('file', file);
        });

        const response = await axios.post(
            `${API_URL}/api/assets/posts/${postId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    getAllAssets: async () => {
        const response = await axios.get(`${API_URL}/api/assets`);
        return response.data;
    },

    deleteAsset: async (id) => {
        await axios.delete(`${API_URL}/api/assets/${id}`);
    }
};
