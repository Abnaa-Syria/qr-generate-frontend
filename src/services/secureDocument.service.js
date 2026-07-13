import api from '../config/api';

export const secureDocumentService = {
  viewPdfUrl: (recordId) => `${api.defaults.baseURL}/secure-documents/${recordId}/view`,
  viewPdfBlob: (recordId) => api.get(`/secure-documents/${recordId}/view`, { responseType: 'blob' }),
  downloadPdf: (recordId) => api.get(`/secure-documents/${recordId}/download`, { responseType: 'blob' }),
  logPrint: (recordId) => api.post(`/secure-documents/${recordId}/print-log`),
};

