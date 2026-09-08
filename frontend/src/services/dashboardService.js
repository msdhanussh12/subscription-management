import api from './api';

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export default dashboardService;
