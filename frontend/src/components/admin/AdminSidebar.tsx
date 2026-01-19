import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/papers', icon: FileText, label: 'Research Papers' },
  { href: '/admin/strands', icon: Layers, label: 'Strands' },
  { href: '/admin/users', icon: Users, label: 'Users' },
];

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebar } = useAdminStore();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isSidebarCollapsed ? 72 : 256,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 ${isSidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
    >
      {/* Logo */}
      <div className="h-12 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-bold tracking-wider text-foreground">
                  CVNHS Admin
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={`relative flex items-center gap-3 px-4 py-2 lg:py-2.5 transition-colors duration-200 group ${isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-1.5 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
