import apiClient from './client';
// services/api/admin.js
export const adminApi = {
  getSystemHealth: () => apiClient.get('/api/dashboard/super-admin/system-health'),
  getOrganizations: (params) => apiClient.get('/api/dashboard/super-admin/organizations', { params }),
  getGlobalAnalytics: (timeRange) => apiClient.get('/api/dashboard/super-admin/analytics', { params: { timeRange } }),
  getAIModels: () => apiClient.get('/api/dashboard/super-admin/ai-models'),
};

// services/api/analytics.js
export const analyticsApi = {
  getAnalytics: (timeRange) => apiClient.get('/api/dashboard/super-admin/analytics', { params: { timeRange } }),
};

// services/api/ai.js
export const aiApi = {
  getModelStatus: () => apiClient.get('/api/dashboard/super-admin/ai-models'),

getActiveAlerts: (params) => apiClient.get('/api/admin/alerts/active', { params }),
acknowledgeAlert: (alertId) => apiClient.post(`/api/admin/alerts/${alertId}/acknowledge`),
};