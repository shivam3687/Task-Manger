import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Logout on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// Project API calls
export const projectAPI = {
  getAll: () => api.get('/projects'),
  create: (data: { name: string; description?: string }) =>
    api.post('/projects', data),
  getById: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Team Member API calls
export const teamAPI = {
  getMembers: (projectId: string) =>
    api.get(`/projects/${projectId}/members`),
  addMember: (projectId: string, data: { userId: string; role?: string }) =>
    api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
  getAvailableUsers: (projectId: string) =>
    api.get(`/projects/${projectId}/available-users`),
};

// Task API calls
export const taskAPI = {
  getByProject: (projectId: string) =>
    api.get(`/projects/${projectId}/tasks`),
  create: (projectId: string, data: any) =>
    api.post(`/projects/${projectId}/tasks`, data),
  getById: (taskId: string) => api.get(`/tasks/${taskId}`),
  update: (taskId: string, data: any) =>
    api.put(`/tasks/${taskId}`, data),
  updateStatus: (taskId: string, status: string) =>
    api.patch(`/tasks/${taskId}/status`, { status }),
  addComment: (taskId: string, comment: string) =>
    api.post(`/tasks/${taskId}/comments`, { comment }),
  delete: (taskId: string) => api.delete(`/tasks/${taskId}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
};

export default api;
