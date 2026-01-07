import axios from 'axios';
import { API_URL } from '../config';

const apiClient = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
