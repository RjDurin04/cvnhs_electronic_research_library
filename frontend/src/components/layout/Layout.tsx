import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SearchModal } from '@/components/search/SearchModal';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

export const Layout: React.FC = () => {
  const { isDarkMode } = useStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 pt-4">
        <Outlet />
      </main>
      <Footer />
      <SearchModal />
    </div>
  );
};
