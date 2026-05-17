import apiClient from './client';
export const userApi = {
  // Existing viewer-like methods (if needed)
  getStats: (params = {}) => apiClient.get('/dashboard/user/stats', { params }),
  getReports: (params = {}) => apiClient.get('/dashboard/user/reports', { params }),
  exportData: (payload) => apiClient.post('/dashboard/user/export', payload, { responseType: 'blob' }),

  // NEW methods for resource management
  getResources: (params = {}) => apiClient.get('/dashboard/user/resources', { params }),
  getAnomalies: (params = {}) => apiClient.get('/dashboard/user/anomalies', { params }),
  addResource: (data) => apiClient.post('/dashboard/user/resources', data),
  deleteResource: (id) => apiClient.delete(`/dashboard/user/resources/${id}`),
};