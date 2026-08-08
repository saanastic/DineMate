import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const signup = async (payload) => {
  const response = await api.post('/auth/signup', payload);
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
  return response.data;
};

export const logout = async (refreshToken) => {
  if (!refreshToken) return;
  await api.post('/auth/logout', { refresh_token: refreshToken });
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await api.post('/auth/forgot-password', payload);
  return response.data;
};

export const resetPassword = async (payload) => {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
};
