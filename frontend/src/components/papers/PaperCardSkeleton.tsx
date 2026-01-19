import React from 'react';
import { motion } from 'framer-motion';

export const PaperCardSkeleton: React.FC<{ featured?: boolean }> = ({ featured }) => {
  if (featured) {
    return (
      <div className="p-8 lg:p-10 rounded-3xl bg-card border border-border animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-7 w-20 rounded-full bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
        <div className="h-10 w-4/5 rounded bg-muted mb-4" />
        <div className="h-6 w-1/2 rounded bg-muted mb-4" />
        <div className="space-y-2 mb-6">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-20 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border animate-pulse">
      <div className="h-6 w-16 rounded-full bg-muted mb-3" />
      <div className="h-6 w-4/5 rounded bg-muted mb-2" />
      <div className="h-4 w-1/2 rounded bg-muted mb-2" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
  );
};
