// SafeFlow Global — API Client

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('safeflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('safeflow_token');
      localStorage.removeItem('safeflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Workers
export const workersAPI = {
  list: (params) => api.get('/workers/', { params }),
  get: (id) => api.get(`/workers/${id}/`),
  create: (data) => api.post('/workers/register/', data),
  update: (id, data) => api.put(`/workers/${id}/`, data),
  count: () => api.get('/workers/count/'),
};

// Check-ins
export const checkinsAPI = {
  start: (data) => api.post('/checkins/start/', data),
  list: (params) => api.get('/checkins/', { params }),
  active: () => api.get('/checkins/active/'),
  overdue: () => api.get('/checkins/overdue/'),
  ping: (id) => api.post(`/checkins/${id}/ping/`),
  checkout: (id) => api.post(`/checkins/${id}/checkout/`),
};

// Incidents
export const incidentsAPI = {
  list: (params) => api.get('/incidents/', { params }),
  get: (id) => api.get(`/incidents/${id}/`),
  report: (data) => api.post('/incidents/report/', data),
  updateStatus: (id, data) => api.put(`/incidents/${id}/status/`, data),
  count: () => api.get('/incidents/count/'),
};

// Contractors
export const contractorsAPI = {
  list: (params) => api.get('/contractors/', { params }),
  get: (id) => api.get(`/contractors/${id}/`),
  create: (data) => api.post('/contractors/', data),
  rate: (id, data) => api.post(`/contractors/${id}/rate/`, data),
  blacklisted: () => api.get('/contractors/blacklisted/'),
};

// Dashboard
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats/'),
  heatmap: () => api.get('/dashboard/heatmap/'),
};

export default api;
