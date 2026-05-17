import apiClient from './client';

export const logApi = {
  getLogs: (params) => apiClient.get('/logs', { params }),
  streamLogs: (sourceId) => apiClient.get(`/logs/stream/${sourceId}`),
  searchLogs: (query) => apiClient.post('/logs/search', query),
  getLogSources: () => apiClient.get('/logs/sources'),
};