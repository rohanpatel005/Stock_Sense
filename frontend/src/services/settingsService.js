import axios from 'axios';

const API_URL = 'http://localhost:8000/api/settings';

const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const settingsService = {
    getProfileSettings: async () => {
        const response = await axios.get(`${API_URL}/profile/`, { headers: getAuthHeaders() });
        return response.data;
    },
    resetPaperAccount: async (password) => {
        const response = await axios.post(`${API_URL}/reset-paper-account/`, { password }, { headers: getAuthHeaders() });
        return response.data;
    }
};
