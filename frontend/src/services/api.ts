import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  }
);

// Auth
export const apiLogin = (login: string, password: string) =>
  api.post('/auth/login', { login, password }).then(r => r.data);
export const apiRegister = (login: string, password: string) =>
  api.post('/auth/register', { login, password }).then(r => r.data);

// Accounts
export const apiGetAccounts = () => api.get('/accounts').then(r => r.data);
export const apiCreateAccount = (data: any) => api.post('/accounts', data).then(r => r.data);
export const apiUpdateAccount = (id: number, data: any) => api.put(`/accounts/${id}`, data).then(r => r.data);
export const apiDeleteAccount = (id: number) => api.delete(`/accounts/${id}`).then(r => r.data);

// Operations
export const apiGetOperations = (accountId: number, params?: any) =>
  api.get(`/accounts/${accountId}/operations`, { params }).then(r => r.data);
export const apiCreateOperation = (accountId: number, data: any) =>
  api.post(`/accounts/${accountId}/operations`, data).then(r => r.data);
export const apiUpdateOperation = (id: number, data: any) =>
  api.put(`/operations/${id}`, data).then(r => r.data);
export const apiDeleteOperation = (id: number) =>
  api.delete(`/operations/${id}`).then(r => r.data);
export const apiPatchOperationStatut = (id: number, statut?: string) =>
  api.patch(`/operations/${id}/statut`, { statut }).then(r => r.data);
export const apiRapprocher = (accountId: number) =>
  api.post(`/accounts/${accountId}/rapprocher`).then(r => r.data);

// Categories
export const apiGetCategories = () => api.get('/categories').then(r => r.data);
export const apiCreateCategory = (data: any) => api.post('/categories', data).then(r => r.data);
export const apiUpdateCategory = (id: number, data: any) => api.put(`/categories/${id}`, data).then(r => r.data);
export const apiDeleteCategory = (id: number) => api.delete(`/categories/${id}`).then(r => r.data);

// Tiers
export const apiGetTiers = () => api.get('/tiers').then(r => r.data);
export const apiCreateTier = (data: any) => api.post('/tiers', data).then(r => r.data);
export const apiUpdateTier = (id: number, data: any) => api.put(`/tiers/${id}`, data).then(r => r.data);
export const apiDeleteTier = (id: number) => api.delete(`/tiers/${id}`).then(r => r.data);

// Echeances
export const apiGetEcheances = (accountId: number) =>
  api.get(`/accounts/${accountId}/echeances`).then(r => r.data);
export const apiCreateEcheance = (accountId: number, data: any) =>
  api.post(`/accounts/${accountId}/echeances`, data).then(r => r.data);
export const apiUpdateEcheance = (id: number, data: any) =>
  api.put(`/echeances/${id}`, data).then(r => r.data);
export const apiDeleteEcheance = (id: number) =>
  api.delete(`/echeances/${id}`).then(r => r.data);
export const apiApplyEcheances = (accountId: number) =>
  api.post(`/accounts/${accountId}/apply-echeances`).then(r => r.data);

// Import
export const apiImport = (accountId: number, formData: FormData) =>
  api.post(`/accounts/${accountId}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
export const apiGetImportMappings = () => api.get('/import-mappings').then(r => r.data);
export const apiSaveImportMappings = (data: any) => api.post('/import-mappings', data).then(r => r.data);

// Equilibrage
export const apiGetEquilibrage = (account1: number, account2: number) =>
  api.get('/equilibrage', { params: { account1, account2 } }).then(r => r.data);
export const apiPutEcart = (data: any) => api.put('/equilibrage/ecart', data).then(r => r.data);
export const apiDeleteEcart = (id: number) => api.delete(`/equilibrage/ecart/${id}`).then(r => r.data);
export const apiGetEquilibragePrefs = () => api.get('/equilibrage/preferences').then(r => r.data);
export const apiPutEquilibragePrefs = (data: any) => api.put('/equilibrage/preferences', data).then(r => r.data);

// Statistics
export const apiGetStatistics = (params: any) =>
  api.get('/statistics', { params }).then(r => r.data);

export default api;
