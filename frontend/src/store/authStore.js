// SafeFlow Global — Auth Store (Zustand)

import { create } from 'zustand';
import { authAPI } from '../api/client';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('safeflow_user') || 'null'),
  token: localStorage.getItem('safeflow_token') || null,
  isAuthenticated: !!localStorage.getItem('safeflow_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('safeflow_token', data.access_token);
      localStorage.setItem('safeflow_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.access_token, isAuthenticated: true, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Login failed', loading: false });
      return false;
    }
  },

  setUser: (user) => {
    localStorage.setItem('safeflow_user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('safeflow_token');
    localStorage.removeItem('safeflow_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
