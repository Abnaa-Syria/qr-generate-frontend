import api from '../config/api';

export const citizenRecordService = {
  getAll: (params = {}) => api.get('/citizen-records', { params }),
  getById: (id) => api.get(`/citizen-records/${id}`),
  getSummary: (id) => api.get(`/citizen-records/${id}/summary`),
  create: (data) => api.post('/citizen-records', data),
  update: (id, data) => api.put(`/citizen-records/${id}`, data),
  delete: (id) => api.delete(`/citizen-records/${id}`),
  changeStatus: (id, status) => api.patch(`/citizen-records/${id}/status`, { status }),

  // Images
  getImages: (recordId) => api.get(`/citizen-records/${recordId}/images`),
  uploadImages: (recordId, formData) =>
    api.post(`/citizen-records/${recordId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (recordId, imageId) => api.delete(`/citizen-records/${recordId}/images/${imageId}`),
  reorderImages: (recordId, images) => api.patch(`/citizen-records/${recordId}/images/reorder`, { images }),
  importFromScanFolder: (recordId) => api.post(`/citizen-records/${recordId}/import-from-scan-folder`),

  // PDF
  generatePdf: (recordId) => api.post(`/citizen-records/${recordId}/generate-pdf`),
  getPdfInfo: (recordId) => api.get(`/citizen-records/${recordId}/pdf/info`),

  // QR
  generateQr: (recordId) => api.post(`/citizen-records/${recordId}/generate-qr`),
  regenerateQr: (recordId) => api.post(`/citizen-records/${recordId}/regenerate-qr`),
  getQrInfo: (recordId) => api.get(`/citizen-records/${recordId}/qr`),
  downloadQrBlob: (recordId) =>
    api.get(`/citizen-records/${recordId}/qr/download`, { responseType: 'blob' }),
  downloadQr: (recordId) => `/api/citizen-records/${recordId}/qr/download`,

  // Lifecycle
  archive: (id) => api.patch(`/citizen-records/${id}/archive`),
  restore: (id) => api.patch(`/citizen-records/${id}/restore`),
  markActive: (id) => api.patch(`/citizen-records/${id}/mark-active`),
  markDraft: (id) => api.patch(`/citizen-records/${id}/mark-draft`),
  getQrTokens: (recordId) => api.get(`/citizen-records/${recordId}/qr-tokens`),
};

