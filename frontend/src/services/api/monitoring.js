// services/api/monitoring.js
import apiClient from './client';
export const monitoringApi = {
  getHealth: () => apiClient.get('/monitoring/health'),
  getPerformance: (params) => apiClient.get('/monitoring/performance', { params }),
  getAlerts: (params) => apiClient.get('/monitoring/alerts', { params }),
};