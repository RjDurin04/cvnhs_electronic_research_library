import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Moon, Sun, Menu, X, BookOpen, LogOut, LogIn } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/adminStore';
import { useNavigate } from 'react-router-dom';
import schoolLogo from '@/assets/images/logo.jpg';

const navLinks = [
  { href: '/home', label: 'Home' },
  { href: '/papers', label: 'All Research Papers' },
  { href: '/strands', label: 'Strands' },
  { href: '/about', label: 'About' },
];

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, setSearchModalOpen, isMobileMenuOpen, setMobileMenuOpen } = useStore();
  const { isAuthenticated, logout } = useAdminStore();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-primary/20 shadow-sm overflow-hidden p-0.5">
              <img src={schoolLogo} alt="CVNHS Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
              CVNHS <span className="text-primary/90">Research</span>
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground sm:hidden">
              CVNHS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              aria-label="Search papers"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-bold hidden sm:block">Sign Out</span>
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label="Login"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-bold hidden sm:block">Sign In</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-md"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-2 mt-2 border-t border-border/40"
              >
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-base font-bold">Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-primary/10 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="text-base font-bold">Sign In</span>
                  </Link>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
