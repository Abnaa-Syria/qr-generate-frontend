import api from '../config/api';

export const settingService = {
  getAll: (params) => api.get('/settings', { params }),
  getByKey: (key) => api.get(`/settings/${key}`),
  update: (key, value) => api.put(`/settings/${key}`, { value }),
  bulkUpdate: (settings) => api.put('/settings/bulk-update', { settings }),
};
