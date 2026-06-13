import axios from 'axios';

const viewerClient = axios.create({
  baseURL: '',          
  withCredentials: true,
});

export const viewerApi = {
  getStats: (params) => viewerClient.get('/dashboard/viewer/stats', { params }),
  getReports: (params) => viewerClient.get('/dashboard/viewer/reports', { params }),
  getPopularDashboards: (params) => viewerClient.get('/dashboard/viewer/dashboards/popular', { params }),
  getQuickView: (params) => viewerClient.get('/dashboard/viewer/quick-view', { params }),
  exportData: (payload) => viewerClient.post('/dashboard/viewer/export', payload, { responseType: 'blob' }),
  getAvailableServices: () => viewerClient.get('/dashboard/viewer/services'),

  getResources: (params) => viewerClient.get('/dashboard/viewer/resources', { params }),
  addResource: (data) => viewerClient.post('/dashboard/viewer/resources', data),
  deleteResource: (id) => viewerClient.delete(`/dashboard/viewer/resources/${id}`),

  getAnomalies: (params) => viewerClient.get('/dashboard/viewer/anomalies', { params }),
  getAIRecommendations: (params) => viewerClient.get('/dashboard/viewer/ai-recommendations', { params }),
  applyAIRecommendation: (payload) => viewerClient.post('/dashboard/viewer/ai-recommendations/apply', payload),

  getLiveLogs: (resourceId, since) => viewerClient.get('/dashboard/viewer/logs/live', { params: { resourceId, since } }),
  getResourceAnalytics: (resourceId) => viewerClient.get(`/dashboard/viewer/analytics/resource/${resourceId}`),

  getAlerts: (params) => viewerClient.get('/dashboard/viewer/alerts', { params }),

  generateReport: (payload) => viewerClient.post('/dashboard/viewer/reports/generate', payload),

  downloadReport: (reportId, format = 'json') =>
    viewerClient.get(`/dashboard/viewer/reports/${reportId}/download`, {
      params: { format },
      responseType: 'blob'
    })
};