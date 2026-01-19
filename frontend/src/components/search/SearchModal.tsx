import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { mockPapers, searchPapers, Paper } from '@/data/mockPapers';
import { PaperCard } from '@/components/papers/PaperCard';

export const SearchModal: React.FC = () => {
  const navigate = useNavigate();
  const { isSearchModalOpen, setSearchModalOpen, setSearchQuery } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Paper[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchPapers(query);
      setResults(searchResults.slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query);
      setSearchModalOpen(false);
      navigate('/papers');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchModalOpen(false);
    }
  };

  if (!isSearchModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setSearchModalOpen(false)}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          className="relative w-full max-w-2xl bg-card rounded-3xl shadow-elevated border border-border overflow-hidden"
        >
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-4 p-6 border-b border-border">
              <Search className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search papers, authors, keywords..."
                className="flex-1 text-lg bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </form>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() && results.length > 0 && (
              <div className="p-4 space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold px-2">
                  {results.length} result{results.length > 1 ? 's' : ''} found
                </p>
                {results.map((paper, index) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigate(`/papers/${paper.id}`);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="p-4 rounded-2xl hover:bg-accent transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
                            {paper.strand}
                          </span>
                          <h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {paper.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {paper.authors.join(', ')} • {paper.school_year}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {query.trim() && results.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or check the spelling
                </p>
              </div>
            )}

            {!query.trim() && (
              <div className="p-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {['STEM', 'mental health', 'organic fertilizer', 'social media', 'hydroponics'].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View All */}
          {query.trim() && results.length > 0 && (
            <div className="p-4 border-t border-border">
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all btn-press focus-ring"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
