import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { AdminToast } from './AdminToast';
import { useAdminStore } from '@/store/adminStore';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isSidebarCollapsed, toggleSidebar } = useAdminStore();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Ensure dark mode and handle responsiveness
  useEffect(() => {
    document.documentElement.classList.add('dark');

    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="min-h-screen flex flex-col flex-1">
        <motion.div
          initial={false}
          animate={{
            paddingLeft: isDesktop ? (isSidebarCollapsed ? 72 : 256) : 0
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed top-0 right-0 left-0 z-20"
        >
          <AdminTopbar />
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            paddingLeft: isDesktop ? (isSidebarCollapsed ? 72 : 256) : 0
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="min-h-screen flex flex-col flex-1 transition-all duration-300"
        >
          <main className="flex-1 p-4 lg:p-6 mt-12">
            <Outlet />
          </main>
        </motion.div>
      </div>
      <AdminToast />
    </div>
  );
};
