import api from './api';

export const subscriptionService = {
  async getAll(filters = {}) {
    const { search, status, billingCycle } = filters;
    const params = {};
    if (search) params.search = search;
    if (status && status !== 'All') params.status = status;
    if (billingCycle && billingCycle !== 'All') params.billingCycle = billingCycle;

    const response = await api.get('/subscriptions', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/subscriptions/${id}/status`, { status });
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/subscriptions/${id}`);
    return response.data;
  }
};

export default subscriptionService;
