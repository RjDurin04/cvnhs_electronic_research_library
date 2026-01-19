import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
};

export const AdminToast: React.FC = () => {
  const { toasts, removeToast } = useAdminStore();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`flex items-start gap-3 p-4 rounded-2xl shadow-elevated ${colors[toast.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
