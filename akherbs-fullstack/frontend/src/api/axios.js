import axios from 'axios';

// Uses the Vite dev proxy by default ('/api' -> http://localhost:5000).
// Set VITE_API_URL in .env to point somewhere else (e.g. production API).
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// Attach whichever token is present (customer or admin) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ak_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
