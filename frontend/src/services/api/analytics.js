
import apiClient from './client';
export const analyticsApi = {
  getAnalytics: (timeRange) => apiClient.get('/api/dashboard/super-admin/analytics', { params: { timeRange } }),

  // Get analytics data for a given time range
  getAnalytics: (timeRange) => apiClient.get('/api/analytics', { params: { timeRange } }),
  
  // You can add more analytics endpoints as needed
  getTopSources: () => apiClient.get('/api/analytics/top-sources'),
  getAnomalyTrends: (params) => apiClient.get('/api/analytics/anomalies', { params }),
};