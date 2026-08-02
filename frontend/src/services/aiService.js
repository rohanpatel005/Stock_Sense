import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/ai';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const aiService = {
  getHistory: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AI history:', error);
      throw error;
    }
  },

  sendMessage: async (message) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/`,
        { message },
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send message to AI:', error);
      throw error;
    }
  },

  clearHistory: async () => {
    try {
      await axios.delete(`${API_BASE_URL}/history/`, {
        headers: getHeaders(),
      });
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  }
};
