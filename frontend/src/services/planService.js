import api from './api';

export const planService = {
  async getAll() {
    const response = await api.get('/plans');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/plans/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/plans', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/plans/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  }
};

export default planService;
