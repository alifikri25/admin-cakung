import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://cakung-barat-server-1065513777845.asia-southeast2.run.app';

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
