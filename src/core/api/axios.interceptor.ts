import { axiosClient } from './axios.client';
import { tokenStorage } from '../auth/storage/token.storage';

axiosClient.interceptors.request.use(async (config) => {
  const session = await tokenStorage.get();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});
