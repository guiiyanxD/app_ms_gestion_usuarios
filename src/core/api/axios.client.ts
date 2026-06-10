import axios from 'axios';
import { REST_BASE_URL } from '@env';

export const axiosClient = axios.create({
  baseURL: REST_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
