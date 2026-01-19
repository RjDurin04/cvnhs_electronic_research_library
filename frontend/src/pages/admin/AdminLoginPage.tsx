import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Lock, Check, Loader2, ArrowRight } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { FloatingInput } from '@/components/auth/FloatingInput';
import { SuccessConfetti } from '@/components/auth/SuccessConfetti';
import schoolBg from '@/assets/images/school-bg.jpg';
import schoolLogo from '@/assets/images/logo.jpg';

type LoginState = 'idle' | 'loading' | 'success' | 'error';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser, addToast } = useAdminStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [showCard, setShowCard] = useState(false);

  // Force light mode on login page (ensuring it doesn't default to dark)
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    // Animate card entrance after mount
    const timer = setTimeout(() => setShowCard(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Redirect based on role
      const redirectPath = currentUser.role === 'admin' ? '/admin' : '/home';
      navigate(redirectPath);
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setLoginState('error');
      addToast({ type: 'error', title: 'Missing credentials', message: 'Please enter both username and password' });
      return;
    }

    setLoginState('loading');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      const success = await login(username, password);

      if (success) {
        setLoginState('success');
        addToast({ type: 'success', title: 'Welcome back!', message: 'Successfully authenticated' });

        // Delay redirect to show success animation
        setTimeout(() => {
          // Use a fresh check or just rely on the navigate
          const user = useAdminStore.getState().currentUser;
          const redirectPath = user?.role === 'admin' ? '/admin' : '/home';
          navigate(redirectPath);
        }, 800);
      } else {
        setLoginState('error');
        addToast({ type: 'error', title: 'Authentication failed', message: 'Invalid username or password' });

        // Reset to idle after error animation
        setTimeout(() => setLoginState('idle'), 600);
      }
    } catch {
      setLoginState('error');
      addToast({ type: 'error', title: 'Network error', message: 'Please try again' });
      setTimeout(() => setLoginState('idle'), 600);
    }
  };



  return (
    <div className="h-screen flex items-center justify-center overflow-hidden relative bg-slate-50">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Info / Intro (Hidden on mobile or stacks) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col justify-center px-12 xl:px-20 relative overflow-hidden group"
        >
          {/* Background Image with Cinematic Overlay */}
          <div className="absolute inset-0">
            <img
              src={schoolBg}
              alt="School Background"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform [transition-duration:2000ms] ease-out"
            />
            {/* Multi-layered Premium Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-950/95 via-teal-900/80 to-slate-900/95 mix-blend-multiply" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_70%)]" />
            <div className="absolute inset-0 bg-teal-500/5 mix-blend-overlay" />

            {/* Animated Light Beam */}
            <motion.div
              animate={{
                opacity: [0.1, 0.2, 0.1],
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent skew-x-[-20deg]"
            />
          </div>

          <div className="max-w-xl relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center mb-10 shadow-3xl shadow-teal-500/30 ring-4 ring-teal-400/20 overflow-hidden"
            >
              <img src={schoolLogo} alt="CVNHS Logo" className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
                Catubig Valley <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                  National High School
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="h-1.5 w-24 bg-gradient-to-r from-teal-400 to-transparent mb-10 rounded-full origin-left"
            />

            <div className="space-y-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full backdrop-blur-md">
                  <span className="text-teal-300 text-xs font-black uppercase tracking-[0.2em]">Research Archive</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-bold text-teal-50/90"
              >
                Electronic Research Library
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-teal-100/70 text-lg leading-relaxed max-w-lg"
              >
                Access a legacy of knowledge. Our digital archive preserves and showcases the academic excellence of the CVNHS community.
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Form with Pattern */}
        <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/20" />

          {/* Abstract Design Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Spinning Dashed Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] border border-dashed border-teal-200/40 rounded-full opacity-30"
            />

            {/* Inner Rotating Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[5%] -right-[5%] w-[500px] h-[500px] border-[2px] border-teal-100/30 rounded-full opacity-40"
            />

            {/* Abstract Floating Shapes */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-[10%] w-32 h-32 bg-gradient-to-tr from-teal-200/20 to-blue-200/20 rounded-3xl blur-2xl transform rotate-12"
            />

            <motion.div
              animate={{
                y: [0, 30, 0],
                x: [0, -10, 0],
                rotate: [0, -10, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 right-[10%] w-40 h-40 bg-gradient-to-bl from-indigo-200/20 to-teal-200/20 rounded-full blur-3xl"
            />

            {/* Geometric Accents */}
            <div className="absolute top-[15%] right-[20%] w-4 h-4 border border-teal-300/30 rotate-45" />
            <div className="absolute bottom-[20%] left-[15%] w-6 h-6 border-2 border-teal-300/20 rounded-full" />
            <div className="absolute top-[40%] right-[5%] w-2 h-2 bg-teal-300/30 rounded-full" />

            {/* Grid Overlay with Mask */}
            <div
              className="absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle at 60% 40%, black 20%, transparent 70%)'
              }}
            />
          </div>

          <AnimatePresence>
            {showCard && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: loginState === 'success' ? 1.02 : 1,
                  y: loginState === 'success' ? -5 : 0
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`w-full max-w-sm z-10 ${loginState === 'error' ? 'animate-shake' : ''}`}
              >
                {/* Confetti */}
                <SuccessConfetti isActive={loginState === 'success'} />

                <div className="relative">

                  {/* Title - Compact & Professional */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
                      CVNHS Portal
                    </h1>
                    <p className="text-teal-600 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                      CVNHS Research Archive
                    </p>
                  </div>

                  {/* Form - High Density */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <FloatingInput
                      id="username"
                      label="Username"
                      type="text"
                      value={username}
                      onChange={setUsername}
                      error={loginState === 'error'}
                      icon={<User className="w-4 h-4" />}
                      autoComplete="username"
                    />

                    <FloatingInput
                      id="password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      error={loginState === 'error'}
                      icon={<Lock className="w-4 h-4" />}
                      autoComplete="current-password"
                    />

                    {/* Submit Button - Compact & Modern */}
                    <motion.button
                      type="submit"
                      disabled={loginState === 'loading' || loginState === 'success'}
                      whileHover={{ scale: loginState === 'idle' ? 1.01 : 1 }}
                      whileTap={{ scale: loginState === 'idle' ? 0.99 : 1 }}
                      className={`
                        w-full h-12 rounded-xl font-bold text-sm
                        flex items-center justify-center gap-2
                        transition-all duration-300 outline-none
                        disabled:cursor-not-allowed
                        shadow-lg shadow-teal-500/10
                        ${loginState === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'text-white'}
                      `}
                      style={loginState !== 'success' ? {
                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                      } : undefined}
                    >
                      {loginState === 'loading' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : loginState === 'success' ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span>Sign In</span>
                      )}
                    </motion.button>
                  </form>


                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add shake animation style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div >
  );
};

export default AdminLoginPage;
