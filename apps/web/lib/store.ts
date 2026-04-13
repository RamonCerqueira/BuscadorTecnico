import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SessionState = {
  token: string | null;
  userType: 'client' | 'technician' | 'company' | 'admin' | null;
  setSession: (token: string, userType: SessionState['userType']) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      userType: null,
      setSession: (token, userType) => set({ token, userType }),
      clearSession: () => set({ token: null, userType: null })
    }),
    { name: 'buscador-session' }
  )
);
