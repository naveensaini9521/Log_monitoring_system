import apiClient from './client';

export const userApi = {
  getStats: (params = {}) => apiClient.get('/dashboard/user/stats', { params }),
  getReports: (params = {}) => apiClient.get('/dashboard/user/reports', { params }),
  exportData: (payload) => apiClient.post('/dashboard/user/export', payload, { responseType: 'blob' }),

  getResources: (params = {}) => apiClient.get('/dashboard/user/resources', { params }),
  getAnomalies: (params = {}) => apiClient.get('/dashboard/user/anomalies', { params }),
  addResource: (data) => apiClient.post('/dashboard/user/resources', data),
  deleteResource: (id) => apiClient.delete(`/dashboard/user/resources/${id}`),

  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),

  getApiKeys: () => apiClient.get('/auth/api-keys'),
  createApiKey: (data) => apiClient.post('/auth/api-keys', data),
  revokeApiKey: (id) => apiClient.delete(`/auth/api-keys/${id}`),
};