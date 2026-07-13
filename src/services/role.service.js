import api from '../config/api';

export const roleService = {
  getAll: (params) => api.get('/roles', { params }),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  updatePermissions: (id, permissionIds) => api.patch(`/roles/${id}/permissions`, { permissionIds }),
  getPermissions: (params) => api.get('/permissions', { params }),
};
