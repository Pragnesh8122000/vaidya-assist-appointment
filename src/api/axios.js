import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor - handle token refresh and session expiry. Audit FE-1.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Token expired — attempt a silent refresh once.
    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed — session is over.
        clearSessionAndRedirect();
        return Promise.reject(err);
      }
    }

    // Any other 401 means the session is no longer valid (invalid/revoked token,
    // account suspended, malformed JWT, etc.). Force re-authentication — but skip
    // the auth endpoints themselves so credential errors during login/register
    // are surfaced to the form instead of bouncing to /login.
    if (status === 401 && !isAuthEndpoint(originalRequest?.url)) {
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  }
);

function isAuthEndpoint(url) {
  return typeof url === 'string' && /\/auth\/(login|register|register-patient|refresh-token|google|complete-profile)/.test(url);
}

function clearSessionAndRedirect() {
  localStorage.clear();
  // Avoid a redirect loop when already on /login.
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?reason=session_expired';
  }
}

export default api;
