// services/api/index.ts
export { default as apiClient } from './client';
export { authApi } from './auth';
export { logApi } from './logs';
export { alertApi } from './alerts';
export { analyticsApi } from './analytics';
export { aiApi } from './ai';
// export { monitoringApi } from './monitoring';   // ensure this file exists

// Import role APIs from their dedicated files
export { adminApi } from './admin';      // uses your admin.ts with getActiveAlerts etc.
export { orgApi } from './org';
export { securityApi } from './security';
export { devopsApi } from './devops';
export { userApi } from './user';
export { viewerApi } from './viewer';