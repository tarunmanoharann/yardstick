import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  getProfile: async () => {
    return await api.get('/auth/me');
  }
};

export const noteService = {
  getAllNotes: async () => {
    return await api.get('/notes');
  },
  getNote: async (id) => {
    return await api.get(`/notes/${id}`);
  },
  createNote: async (noteData) => {
    return await api.post('/notes', noteData);
  },
  updateNote: async (id, noteData) => {
    return await api.put(`/notes/${id}`, noteData);
  },
  deleteNote: async (id) => {
    return await api.delete(`/notes/${id}`);
  }
};

export const tenantService = {
  upgradeToPro: async (slug) => {
    return await api.post(`/tenants/${slug}/upgrade`);
  }
};

export default api;