import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_REST_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
