import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';

interface Stats {
  papers: number;
  downloads: number;
  strands: number;
  since: number;
}

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { setSearchQuery, setSearchModalOpen } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [stats, setStats] = useState<Stats>({ papers: 0, downloads: 0, strands: 0, since: 2020 });
  const [strands, setStrands] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, strandsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/strands')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (strandsRes.ok) {
          const strandsData = await strandsRes.json();
          // Logic for "Popular": Sort by paperCount or downloads, then take top 4
          const popularStrands = strandsData
            .sort((a: any, b: any) => b.paperCount - a.paperCount)
            .slice(0, 4)
            .map((s: any) => s.short);

          setStrands(popularStrands);
        }
      } catch (error) {
        console.error('Failed to fetch hero data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue);
      navigate('/papers');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const displayStats = [
    { value: stats.papers > 0 ? `${stats.papers}+` : '...', label: 'Papers' },
    { value: stats.downloads > 0 ? `${stats.downloads}+` : '...', label: 'Downloads' },
    { value: stats.strands > 0 ? String(stats.strands) : '...', label: 'Strands' },
    { value: String(stats.since), label: 'Since' },
  ];

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 md:py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/30" />
      <div className="absolute inset-0 noise-overlay opacity-20" />

      {/* Decorative elements */}
      <div className="absolute top-10 md:top-20 left-10 w-48 h-48 md:w-72 md:h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 md:bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div variants={itemVariants} className="mb-4 md:mb-6">
          <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-accent/50 backdrop-blur-sm text-accent-foreground text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] border border-accent-foreground/10">
            Catubig Valley National High School
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-4 md:mb-6"
        >
          Electronic{' '}
          <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Research</span>
          {' '}Library
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-2"
        >
          Explore outstanding student research across all strands.
          <span className="hidden md:inline"> Discover, learn, and get inspired by excellence.</span>
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="relative max-w-2xl mx-auto mb-8 md:mb-10"
        >
          <form onSubmit={handleSearch} className="group relative">
            <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary">
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search research, authors..."
              className="w-full py-4 md:py-5 pl-12 md:pl-16 pr-12 md:pr-40 text-sm md:text-lg rounded-2xl md:rounded-full bg-card/80 backdrop-blur-md border border-border group-focus-within:border-primary/50 group-focus-within:ring-4 group-focus-within:ring-primary/10 transition-all outline-none shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all items-center gap-2"
            >
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex md:hidden p-2 rounded-xl bg-primary text-primary-foreground"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {strands.length > 0 && (
            <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
              <span className="text-[10px] md:text-sm text-muted-foreground font-medium uppercase tracking-wider">Popular:</span>
              <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0 gap-2 px-4 md:px-0">
                {strands.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      navigate('/papers');
                    }}
                    className="whitespace-nowrap px-3 py-1 rounded-lg bg-secondary/50 hover:bg-primary/10 hover:text-primary text-secondary-foreground text-[11px] md:text-sm font-semibold transition-all border border-border/50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Grid - Redesigned for Mobile */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-0 max-w-3xl mx-auto rounded-2xl md:rounded-none overflow-hidden border md:border-none border-border/50 bg-card/30 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none"
        >
          {displayStats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`text-center p-4 md:p-6 border-border/50 ${idx % 2 === 0 ? 'border-r' : ''
                } ${idx < 2 ? 'border-bottom md:border-bottom-0' : ''
                } md:border-none`}
            >
              <div className="text-xl md:text-4xl font-extrabold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] md:text-sm text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
