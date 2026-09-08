import api from './api';

export const customerService = {
  async getAll(search = '') {
    const params = search ? { search } : {};
    const response = await api.get('/customers', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/customers', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};

export default customerService;
