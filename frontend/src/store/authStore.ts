import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: '',
      login: (token, username) => set({ token, username }),
      logout: () => set({ token: null, username: '' }),
    }),
    { name: 'finance-auth' }
  )
);
