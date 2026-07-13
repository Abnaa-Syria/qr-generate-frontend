import api from '../config/api';

export const scanDeviceService = {
  getAll: (params) => api.get('/scan-devices', { params }),
  getById: (id) => api.get(`/scan-devices/${id}`),
  create: (data) => api.post('/scan-devices', data),
  update: (id, data) => api.put(`/scan-devices/${id}`, data),
  delete: (id) => api.delete(`/scan-devices/${id}`),
  changeStatus: (id, status) => api.patch(`/scan-devices/${id}/status`, { status }),
};
