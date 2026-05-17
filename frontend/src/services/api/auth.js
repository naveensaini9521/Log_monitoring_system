import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  register: (userData) => apiClient.post('/api/auth/register', userData),
  logout: () => apiClient.post('/api/auth/logout'),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  refreshToken: () => apiClient.post('/api/auth/refresh'),
  forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/api/auth/reset-password', { token, password }),
  updateProfile: (userData) => apiClient.put('/api/auth/profile', userData)
};