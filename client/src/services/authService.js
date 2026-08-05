import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/api/v1/auth/login', credentials);
  return response.data;
};

export const signup = async (payload) => {
  const response = await api.post('/api/v1/auth/signup', payload);
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
  return response.data;
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return;
  await api.post('/api/v1/auth/logout', { refresh_token: refreshToken });
};

export const getProfile = async () => {
  const response = await api.get('/api/v1/auth/me');
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await api.post('/api/v1/auth/forgot-password', payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await api.post('/api/v1/auth/reset-password', payload);
  return response.data;
};
