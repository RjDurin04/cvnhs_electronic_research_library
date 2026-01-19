import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface FloatingInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  icon,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isFloating = isFocused || value.length > 0;
  const isPassword = type === 'password';

  return (
    <div className="relative w-full group">
      {/* Precision Label - Always persistent and aligned */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <label
          htmlFor={id}
          className={`text-[10px] uppercase tracking-widest font-bold transition-colors duration-300 ${error ? 'text-red-500' : isFocused ? 'text-teal-600' : 'text-slate-500'
            }`}
        >
          {label}
        </label>
        {error && (
          <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">
            {value.length > 0 ? 'Invalid' : 'Required'}
          </span>
        )}
      </div>

      {/* Input Container - Light Glass-morphism Aesthetic */}
      <div
        className={`
          relative h-12 flex items-center px-4 rounded-lg
          bg-white shadow-sm border transition-all duration-500
          ${error
            ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
            : isFocused
              ? 'border-teal-500/50 bg-teal-50/[0.2] shadow-[0_0_20px_rgba(20,184,166,0.08)]'
              : 'border-slate-200 group-hover:border-slate-300'
          }
        `}
      >
        {/* Left Icon - Perfectly Centered */}
        {icon && (
          <div className={`mr-3 transition-colors duration-300 ${error ? 'text-red-500' : isFocused ? 'text-teal-600' : 'text-slate-400'
            }`}>
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
          </div>
        )}

        {/* Real Input */}
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:ring-0"
        />

        {/* Password Toggle - Perfectly Aligned */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-slate-400 hover:text-teal-600 transition-colors p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Focus Scanline Effect */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          className={`absolute bottom-0 left-0 right-0 h-[2px] origin-center ${error ? 'bg-red-500' : 'bg-teal-500'
            }`}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Background Glow Depth */}
      <div className={`
        absolute -inset-1 rounded-xl -z-10 blur-xl transition-opacity duration-1000
        ${isFocused ? 'bg-teal-500/10 opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
};
