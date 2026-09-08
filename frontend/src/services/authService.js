import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async signup(data) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network failures on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

export default authService;
