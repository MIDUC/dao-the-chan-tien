import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Set up interceptor to add token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function useApi() {
  const get = async (url: string) => {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  };

  const post = async (url: string, data: any) => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error posting to ${url}:`, error);
      throw error;
    }
  };

  const put = async (url: string, data: any) => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error putting to ${url}:`, error);
      throw error;
    }
  };

  const del = async (url: string) => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error deleting from ${url}:`, error);
      throw error;
    }
  };

  return { get, post, put, delete: del };
}
