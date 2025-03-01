import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
type QueryConfig<T> = Omit<UseQueryOptions<T, AxiosError>, 'queryKey' | 'queryFn'>;
type MutationConfig<T> = Omit<UseMutationOptions<T, AxiosError, any>, 'mutationFn'>;

export const useApi = {
  // GET request
  get: <T>(
    endpoint: string,
    queryKey: string[],
    config?: QueryConfig<T>
  ) => {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const response = await api.get<T>(endpoint);
        return response.data;
      },
      ...config,
    });
  },

  // POST request
  post: <T>(
    endpoint: string,
    config?: MutationConfig<T>
  ) => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await api.post<T>(endpoint, data);
        return response.data;
      },
      ...config,
    });
  },

  // PUT request
  put: <T>(
    endpoint: string,
    config?: MutationConfig<T>
  ) => {
    return useMutation({
      mutationFn: async (data: any) => {
        const response = await api.put<T>(endpoint, data);
        return response.data;
      },
      ...config,
    });
  },

  // DELETE request
  delete: <T>(
    endpoint: string,
    config?: MutationConfig<T>
  ) => {
    return useMutation({
      mutationFn: async (id: string | number) => {
        const response = await api.delete<T>(`${endpoint}/${id}`);
        return response.data;
      },
      ...config,
    });
  },
};

export default useApi; 