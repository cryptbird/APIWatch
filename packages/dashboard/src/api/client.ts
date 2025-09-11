/**
 * API client with auth header and optional X-Org-Id. Token from authStore (in memory).
 */

import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useOrgStore } from '../store/orgStore';

const baseURL = '/api';

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    const orgId = useOrgStore.getState().selectedOrgId;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (orgId) config.headers['X-Org-Id'] = orgId;
    return config;
  });

  return client;
}

export const apiClient = createClient();
