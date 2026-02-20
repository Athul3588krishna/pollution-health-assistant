import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pollution API
export const pollutionAPI = {
  getPollutionData: (city) => api.get(`/pollution/data?city=${city}`),
  analyzeHealthRisk: (data) => api.post('/pollution/analyze', data),
};

// History API
export const historyAPI = {
  getAll: (limit = 50, skip = 0) => api.get(`/history?limit=${limit}&skip=${skip}`),
  getByLocation: (city) => api.get(`/history/location/${city}`),
  getById: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
  clearAll: () => api.delete('/history'),
};

// Analytics API
export const analyticsAPI = {
  getOverview: (days = 30) => api.get(`/analytics?days=${days}`),
  getLocationAnalytics: (city, days = 30) => api.get(`/analytics/location/${city}?days=${days}`),
  compareLocations: (cities) => api.get(`/analytics/compare?cities=${cities.join(',')}`),
};

// Health API
export const healthAPI = {
  getConditions: () => api.get('/health/conditions'),
};

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const aiAPI = {
  getInsights: () => api.get('/ai/insights')
};

export default api;
