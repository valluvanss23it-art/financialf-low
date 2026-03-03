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

// Profile API
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data: any) => api.put('/profile', data),
};

// Income API
export const incomeAPI = {
  getAll: () => api.get('/income'),
  create: (data: any) => api.post('/income', data),
  update: (id: string, data: any) => api.put(`/income/${id}`, data),
  delete: (id: string) => api.delete(`/income/${id}`),
};

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// Goals API
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

// Assets API
export const assetsAPI = {
  getAll: () => api.get('/assets'),
  create: (data: any) => api.post('/assets', data),
  update: (id: string, data: any) => api.put(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

// Liabilities API
export const liabilitiesAPI = {
  getAll: () => api.get('/liabilities'),
  create: (data: any) => api.post('/liabilities', data),
  update: (id: string, data: any) => api.put(`/liabilities/${id}`, data),
  delete: (id: string) => api.delete(`/liabilities/${id}`),
};

// Insurance API
export const insuranceAPI = {
  getAll: () => api.get('/insurance'),
  create: (data: any) => api.post('/insurance', data),
  update: (id: string, data: any) => api.put(`/insurance/${id}`, data),
  delete: (id: string) => api.delete(`/insurance/${id}`),
};

// Investments API
export const investmentsAPI = {
  getAll: () => api.get('/investments'),
  create: (data: any) => api.post('/investments', data),
  update: (id: string, data: any) => api.put(`/investments/${id}`, data),
  delete: (id: string) => api.delete(`/investments/${id}`),
};

// Savings API
export const savingsAPI = {
  getAll: () => api.get('/savings'),
  create: (data: any) => api.post('/savings', data),
  update: (id: string, data: any) => api.put(`/savings/${id}`, data),
  delete: (id: string) => api.delete(`/savings/${id}`),
};

// Tax API
export const taxAPI = {
  getAll: () => api.get('/tax'),
  create: (data: any) => api.post('/tax', data),
  update: (id: string, data: any) => api.put(`/tax/${id}`, data),
  delete: (id: string) => api.delete(`/tax/${id}`),
};

// Transactions API (unified income + expenses)
export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  create: (data: any) => api.post('/transactions', data),
  getSummary: () => api.get('/transactions/summary'),
};

export default api;
