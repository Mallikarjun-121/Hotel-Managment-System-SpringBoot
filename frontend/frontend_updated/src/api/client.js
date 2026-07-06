import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:9010/api',
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'meridian_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Pull human-readable message from GlobalExceptionHandler shape
export function extractErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.values(data.fieldErrors)[0];
    }
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
