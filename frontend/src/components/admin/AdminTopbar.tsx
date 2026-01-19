import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  User,
  Menu,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/papers': 'Research Papers',
  '/admin/strands': 'Strands',
  '/admin/users': 'Users',
};

export const AdminTopbar: React.FC = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode, currentUser, logout, toggleSidebar } = useAdminStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const pageTitle = pageTitles[location.pathname] || 'Admin';
  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));



  return (
    <header className="h-12 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-xl lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-[10px] lg:text-xs text-muted-foreground mb-0.5">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight className="w-2.5 h-2.5" />}
                  <span>{crumb}</span>
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
              {pageTitle}
            </h1>
          </div>
          <h1 className="text-lg font-bold text-foreground sm:hidden truncate max-w-[150px]">
            {pageTitle}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 lg:p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 lg:w-5 h-5" /> : <Moon className="w-4.5 h-4.5 lg:w-5 h-5" />}
            </motion.div>
          </button>

          {/* User Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-secondary hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">
                {currentUser?.name || 'Admin'}
              </span>
            </button>

            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden"
              >
                <div className="p-3 border-b border-border">
                  <p className="font-medium text-foreground">{currentUser?.name}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
