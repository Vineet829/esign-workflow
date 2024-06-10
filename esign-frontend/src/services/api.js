import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const uploadPdf = (formData) => api.post('/pdf/upload', formData);
export const setupPdf = (payload) => api.post('/pdf', payload);
export const submitPdfForEsign = (documentId) => api.post(`/pdf/${documentId}/submit`);

export default api;
