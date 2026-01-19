import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  searchQuery: string;
  selectedStrands: string[];
  selectedYear: string;
  sortBy: 'title' | 'newest' | 'downloads';
}

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Search & Filters
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  toggleStrand: (strand: string) => void;
  setSelectedYear: (year: string) => void;
  setSortBy: (sort: 'title' | 'newest' | 'downloads') => void;
  clearFilters: () => void;

  // UI State
  isSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const initialFilters: FilterState = {
  searchQuery: '',
  selectedStrands: [],
  selectedYear: '',
  sortBy: 'title',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
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

      // Filters
      filters: initialFilters,
      setSearchQuery: (query) =>
        set((state) => ({
          filters: { ...state.filters, searchQuery: query },
        })),
      toggleStrand: (strand) =>
        set((state) => ({
          filters: {
            ...state.filters,
            selectedStrands: state.filters.selectedStrands.includes(strand)
              ? state.filters.selectedStrands.filter((s) => s !== strand)
              : [...state.filters.selectedStrands, strand],
          },
        })),
      setSelectedYear: (year) =>
        set((state) => ({
          filters: { ...state.filters, selectedYear: year },
        })),
      setSortBy: (sort) =>
        set((state) => ({
          filters: { ...state.filters, sortBy: sort },
        })),
      clearFilters: () => set({ filters: initialFilters }),

      // UI State
      isSearchModalOpen: false,
      setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: 'cvnhs-library-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);

// Initialize dark mode on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('cvnhs-library-storage');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.state?.isDarkMode !== false) {
      document.documentElement.classList.add('dark');
    }
  } else {
    // Default to dark mode for public site
    document.documentElement.classList.add('dark');
  }
}
