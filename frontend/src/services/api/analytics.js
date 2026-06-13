import apiClient from './client';

export const analyticsApi = {

  getAnalytics: (timeRange) => apiClient.get('/api/dashboard/super-admin/analytics', { params: { timeRange } }),
  getAnalytics: (timeRange) => apiClient.get('/api/analytics', { params: { timeRange } }),
  getTopSources: () => apiClient.get('/api/analytics/top-sources'),
  getAnomalyTrends: (params) => apiClient.get('/api/analytics/anomalies', { params }),

  getTimeSeries: (service, days = 7) =>
    apiClient.get('/dashboard/viewer/analytics/timeseries', {
      params: { service, days }
    }),

  // Top error messages for a service
  getTopErrors: (service, limit = 10) =>
    apiClient.get('/dashboard/viewer/analytics/top_errors', {
      params: { service, limit }
    }),

  // Severity breakdown for a specific resource ID
  getResourceAnalytics: (resourceId) =>
    apiClient.get(`/dashboard/viewer/analytics/resource/${resourceId}`),
};