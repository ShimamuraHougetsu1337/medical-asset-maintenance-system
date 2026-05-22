import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor – attach JWT access token from localStorage
// ---------------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor – handle 401 by attempting a token refresh, then retry
// ---------------------------------------------------------------------------
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

/** Flush all queued requests with the new token (or reject them on failure). */
function flushQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  pendingQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors that haven't already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (typeof window === 'undefined') {
      // Server-side: cannot access localStorage – reject immediately
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // No refresh token – redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Another refresh is already in-flight – queue this request
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(`${API_BASE}/auth/refresh-token`, {
        refreshToken,
      });

      const data = res.data?.data as
        | { accessToken: string; refreshToken: string }
        | undefined;

      if (!data?.accessToken) throw new Error('Empty refresh response');

      // Persist rotated tokens
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Update default header and retry original request
      axiosInstance.defaults.headers.common['Authorization'] =
        `Bearer ${data.accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      flushQueue(null, data.accessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      // Refresh failed – clear tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
