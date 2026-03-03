// frontend/src/utils/api.js
import axios from 'axios';

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_BASE_URL ||
  'http://localhost:3000/api/v1';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
console.log('🌍 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Automatically attach access token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  // Don't add token for login or register routes
  if (
    token &&
    !config.url.includes('/auth/login') &&
    !config.url.includes('/auth/register')
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ✅ Optional: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - token may have expired');
      // Example: redirect or clear storage if needed
    }
    return Promise.reject(error);
  }
);

export default api;
