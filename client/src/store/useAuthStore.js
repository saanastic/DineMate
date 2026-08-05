import { create } from 'zustand';

const refreshTokenKey = 'dinemate_refresh_token';

const initialRefreshToken = typeof window !== 'undefined' ? localStorage.getItem(refreshTokenKey) : null;

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: initialRefreshToken,
  status: 'idle',
  setCredentials: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined' && refreshToken) {
      localStorage.setItem(refreshTokenKey, refreshToken);
    }
    set({ accessToken, refreshToken, status: 'authenticated' });
  },
  clearCredentials: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(refreshTokenKey);
    }
    set({ user: null, accessToken: null, refreshToken: null, status: 'idle' });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(refreshTokenKey);
    }
    set({ user: null, accessToken: null, refreshToken: null, status: 'idle' });
  },
}));

export default useAuthStore;
