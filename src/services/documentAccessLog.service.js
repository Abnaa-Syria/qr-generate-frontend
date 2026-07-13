import api from '../config/api';

export const documentAccessLogService = {
  getAll: (params = {}) => api.get('/document-access-logs', { params }),
  getById: (id) => api.get(`/document-access-logs/${id}`),
};

