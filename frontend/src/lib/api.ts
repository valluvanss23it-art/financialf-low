import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; fullName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Income API
export const incomeAPI = {
  getAll: () => api.get('/income'),
  getById: (id: string) => api.get(`/income/${id}`),
  create: (data: any) => api.post('/income', data),
  update: (id: string, data: any) => api.put(`/income/${id}`, data),
  delete: (id: string) => api.delete(`/income/${id}`),
};

// Expense API
export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id: string) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// Savings API
export const savingsAPI = {
  getAll: () => api.get('/savings'),
  getById: (id: string) => api.get(`/savings/${id}`),
  create: (data: any) => api.post('/savings', data),
  update: (id: string, data: any) => api.put(`/savings/${id}`, data),
  delete: (id: string) => api.delete(`/savings/${id}`),
};

// Investments API
export const investmentsAPI = {
  getAll: () => api.get('/investments'),
  getById: (id: string) => api.get(`/investments/${id}`),
  create: (data: any) => api.post('/investments', data),
  update: (id: string, data: any) => api.put(`/investments/${id}`, data),
  delete: (id: string) => api.delete(`/investments/${id}`),
};

// Assets API
export const assetsAPI = {
  getAll: () => api.get('/assets'),
  getById: (id: string) => api.get(`/assets/${id}`),
  create: (data: any) => api.post('/assets', data),
  update: (id: string, data: any) => api.put(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

// Liabilities API
export const liabilitiesAPI = {
  getAll: () => api.get('/liabilities'),
  getById: (id: string) => api.get(`/liabilities/${id}`),
  create: (data: any) => api.post('/liabilities', data),
  update: (id: string, data: any) => api.put(`/liabilities/${id}`, data),
  delete: (id: string) => api.delete(`/liabilities/${id}`),
};

// Goals API
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  getById: (id: string) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

// Insurance API
export const insuranceAPI = {
  getAll: () => api.get('/insurance'),
  getById: (id: string) => api.get(`/insurance/${id}`),
  create: (data: any) => api.post('/insurance', data),
  update: (id: string, data: any) => api.put(`/insurance/${id}`, data),
  delete: (id: string) => api.delete(`/insurance/${id}`),
};

// Tax API
export const taxAPI = {
  getAll: () => api.get('/tax'),
  getById: (id: string) => api.get(`/tax/${id}`),
  create: (data: any) => api.post('/tax', data),
  update: (id: string, data: any) => api.put(`/tax/${id}`, data),
  delete: (id: string) => api.delete(`/tax/${id}`),
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: any) => api.put('/profile', data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// News API
export const newsAPI = {
  getAll: () => api.get('/news'),
  getById: (id: string) => api.get(`/news/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  getSummary: () => api.get('/transactions/summary'),
};

export default api;
