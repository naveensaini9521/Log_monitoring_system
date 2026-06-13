import apiClient from './client';
export const alertApi = {
  getAlerts: (params) => apiClient.get('/alerts', { params }),
};