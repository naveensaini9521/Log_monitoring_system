import apiClient from './client';
export const securityApi = {
  getSecurityAlerts: (params) => apiClient.get('/security/alerts', { params }),
  investigateIncident: (incidentId, data) => apiClient.post(`/security/incidents/${incidentId}/investigate`, data),
  getThreatIntel: () => apiClient.get('/security/threat-intel'),
  // Add other security-related endpoints as needed
};