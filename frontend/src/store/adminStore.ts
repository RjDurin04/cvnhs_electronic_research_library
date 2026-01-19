import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AdminState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme (admin defaults to dark)
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Command palette
  isCommandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      currentUser: null,
      login: async (username: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Required for cookies/sessions
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            const data = await response.json();
            set({
              isAuthenticated: true,
              currentUser: {
                id: data.user.id,
                name: data.user.full_name,
                username: data.user.username,
                role: data.user.role,
              },
            });
            return true;
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }
      },
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ isAuthenticated: false, currentUser: null });
        }
      },
      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth/me', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            set({
              isAuthenticated: true,
              currentUser: {
                id: data.user.id,
                name: data.user.full_name,
                username: data.user.username,
                role: data.user.role,
              },
            });
          } else {
            // If server says unauthorized but we think we're logged in, it's a kick/expiry
            if (get().isAuthenticated) {
              set({ isAuthenticated: false, currentUser: null });
              window.location.href = '/'; // Force redirect to login page
              return;
            }
            // Otherwise just ensure state is clear
            set({ isAuthenticated: false, currentUser: null });
          }
        } catch (error) {
          console.error('Check auth error:', error);
          // Don't necessarily logout on network error, only on 401/403
        }
      },

      // Sidebar
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

      // Theme
      isDarkMode: true,
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.isDarkMode;
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newDarkMode };
        }),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).slice(2);
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        setTimeout(() => get().removeToast(id), 4000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      // Command palette
      isCommandOpen: false,
      setCommandOpen: (open) => set({ isCommandOpen: open }),
    }),
    {
      name: 'cvnhs-admin-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isSidebarCollapsed: state.isSidebarCollapsed,
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
      }),
    }
  )
);

// Initialize dark mode for admin
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('cvnhs-admin-storage');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.state?.isDarkMode !== false) {
      document.documentElement.classList.add('dark');
    }
  } else {
    document.documentElement.classList.add('dark');
  }
}
