import axios from 'axios';
import { tokenStorage } from '../auth/storage/token.storage';

export const springAxiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SPRING_REST_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

springAxiosClient.interceptors.request.use(async (config) => {
  const session = await tokenStorage.get();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});
