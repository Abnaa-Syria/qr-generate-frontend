import api from '../config/api';

export const scanLocationService = {
  getAll: (params) => api.get('/scan-locations', { params }),
  getById: (id) => api.get(`/scan-locations/${id}`),
  create: (data) => api.post('/scan-locations', data),
  update: (id, data) => api.put(`/scan-locations/${id}`, data),
  delete: (id) => api.delete(`/scan-locations/${id}`),
  changeStatus: (id, status) => api.patch(`/scan-locations/${id}/status`, { status }),
};
