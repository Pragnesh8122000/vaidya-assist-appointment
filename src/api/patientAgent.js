import axios from 'axios';

const AGENT_API_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:4000/api';

const patientAgentApi = axios.create({
  baseURL: AGENT_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
patientAgentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor - handle token refresh and session expiry. Audit FE-1.
// Same pattern as the main API client (src/api/axios.js): a non-TOKEN_EXPIRED 401
// from the agent service (e.g. patientAuthMiddleware rejecting an invalid profile)
// also means the session is no longer valid, so clear it and force re-authentication.
patientAgentApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/auth/refresh-token`,
          { refreshToken },
        );
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        return patientAgentApi(originalRequest);
      } catch (err) {
        clearSessionAndRedirect();
        return Promise.reject(err);
      }
    }

    if (status === 401 && !isAuthEndpoint(originalRequest?.url)) {
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  },
);

function isAuthEndpoint(url) {
  return typeof url === 'string' && /\/auth\/(login|register|register-patient|refresh-token)/.test(url);
}

function clearSessionAndRedirect() {
  localStorage.clear();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?reason=session_expired';
  }
}

/**
 * Send a message to the Vaidya patient agent.
 *
 * @param {string} message - the user's current message
 * @param {Array<{role: 'user'|'assistant', content: string}>} [history] - conversation history
 * @param {{intent?: string, slots?: Record<string, string>, missingSlots?: string[]}} [conversationState] - multi-turn state from previous response
 * @returns {Promise<{content: string, toolCalled: boolean, toolName?: string, conversationState: {intent: string|null, slots: Record<string, string>, missingSlots: string[]}}>}
 */
export async function sendPatientMessage(message, history = [], conversationState = null) {
  const payload = { message, history };
  if (conversationState) {
    payload.conversationState = conversationState;
  }
  const { data } = await patientAgentApi.post('/agent/patient/message', payload);
  return data.data;
}

export default patientAgentApi;