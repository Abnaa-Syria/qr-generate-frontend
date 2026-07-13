import api from '../config/api';

export const scannerService = {
  verifyQr: (data) => api.post('/scanner/qr/verify', data),
};

