import api from '../config/api';

export const searchService = {
  searchRecords: (params = {}) => api.get('/search/citizen-records', { params }),
};

