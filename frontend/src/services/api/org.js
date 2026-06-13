import apiClient from './client';
export const orgApi = {
  getTeamMembers: (params) => apiClient.get('/org/team', { params }),
  inviteMember: (data) => apiClient.post('/org/invites', data),
  updateMemberRole: (id, role) => apiClient.put(`/org/team/${id}/role`, { role }),
  removeMember: (id) => apiClient.delete(`/org/team/${id}`),
  getLogSources: () => apiClient.get('/org/log-sources'),
  addLogSource: (data) => apiClient.post('/org/log-sources', data),
  updateLogSource: (id, data) => apiClient.put(`/org/log-sources/${id}`, data),
  getApiKeys: () => apiClient.get('/org/api-keys'),
  createApiKey: (data) => apiClient.post('/org/api-keys', data),
  revokeApiKey: (id) => apiClient.delete(`/org/api-keys/${id}`),
  getOrgSettings: () => apiClient.get('/org/settings'),
  updateOrgSettings: (data) => apiClient.put('/org/settings', data),
};