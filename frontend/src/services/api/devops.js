// services/api/devops.js
import apiClient from './client';
export const devopsApi = {
  getSystemMetrics: (params) => apiClient.get('/devops/metrics', { params }),
  getDeployments: (params) => apiClient.get('/devops/deployments', { params }),
  triggerDeployment: (data) => apiClient.post('/devops/deploy', data),
  getAgentStatus: () => apiClient.get('/devops/agents'),
};