import axios from 'axios';
import { getAccessToken, getRefreshToken, setAuth, clearAuth } from '../store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  withCredentials: false,
});

let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function addSubscriber(cb: (token: string) => void) {
  subscribers.push(cb);
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Type the axios error and config to allow a custom _retry flag
    const axiosError = error as import('axios').AxiosError;
    const originalRequest = (axiosError.config || {}) as (import('axios').AxiosRequestConfig & {
      _retry?: boolean;
    });

    if (axiosError.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token: string) => {
            // ensure headers exists
            originalRequest.headers = (originalRequest.headers || {}) as any;
            (originalRequest.headers as any)['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const resp = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL as string}/api/v1/user/refresh-token`,
          { refreshToken }
        );
        const newAccess = resp.data?.accessToken as string;
        if (!newAccess) throw new Error('No access token');
        setAuth(newAccess);
        isRefreshing = false;
        onRefreshed(newAccess);
        originalRequest.headers = (originalRequest.headers || {}) as any;
        (originalRequest.headers as any)['Authorization'] = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (e) {
        isRefreshing = false;
        clearAuth();
        return Promise.reject(axiosError);
      }
    }
    return Promise.reject(axiosError);
  }
);

export default api;
