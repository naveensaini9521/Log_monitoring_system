import apiClient from './client';
export const aiApi = {
  detectAnomalies: (data) => apiClient.post('/api/ai/anomalies', data),
  getModelStatus: () => apiClient.get('/api/dashboard/super-admin/ai-models'),

  // Get AI model statuses
  getModelStatus: () => apiClient.get('/api/ai/models/status'),
  
  // Add other AI-related endpoints
  getTrainingJobs: () => apiClient.get('/api/ai/training-jobs'),
};