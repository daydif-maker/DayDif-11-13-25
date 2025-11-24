import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from './types';

// Base URL - can be configured via environment variable
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.daydif.com';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: Add authentication token from store
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      switch (status) {
        case 401:
          // Unauthorized - handle logout
          console.error('Unauthorized:', message);
          break;
        case 403:
          console.error('Forbidden:', message);
          break;
        case 404:
          console.error('Not found:', message);
          break;
        case 500:
          console.error('Server error:', message);
          break;
        default:
          console.error('API error:', message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error: No response received');
    } else {
      // Error setting up request
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;








