import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PaperCard } from '@/components/papers/PaperCard';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResearchPaper } from '@/types/paper';

export const FeaturedPapers: React.FC = () => {
  const [featuredPapers, setFeaturedPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch('/api/papers');
        if (res.ok) {
          const data: ResearchPaper[] = await res.json();
          // Map backend data to ensure compatibility if needed, though type should match
          const featured = data.filter(p => p.is_featured);
          setFeaturedPapers(featured);
        }
      } catch (error) {
        console.error('Failed to fetch featured papers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPapers();
  }, []);

  const [isPaused, setIsPaused] = React.useState(false);

  // Fallback to empty if no featured papers, or handle empty state gracefully?
  // For now, let's just use what we have.
  const featuredList = featuredPapers.slice(0, 6);
  // Double the list for seamless infinite loop (only if we have items)
  const displayList = featuredList.length > 0 ? [...featuredList, ...featuredList] : [];

  if (isLoading) {
    return (
      <section className="relative py-24 overflow-hidden flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  if (featuredPapers.length === 0) return null; // Hide section if no featured papers


  return (
    <section className="relative py-24 overflow-hidden">
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-container {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: ticker-scroll ${featuredList.length * 10}s linear infinite;
        }
        @media (min-width: 1024px) {
          .ticker-container { gap: 2rem; }
        }
      `}</style>

      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

        {/* Squares Pattern Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            color: 'var(--primary)'
          }}
        />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ willChange: 'transform' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ willChange: 'transform' }}
          />
        </div>
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Featured Research</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            <span className="block">Discover Excellence in</span>
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent underline decoration-primary/20 underline-offset-8">
              Student Research
            </span>
          </h2>
        </div>

        {/* Continuous Ticker Container */}
        <div className="relative">
          <div
            className="ticker-container px-4"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
              willChange: 'transform'
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {displayList.map((paper, index) => (
              <div
                key={`${paper.id}-${index}`}
                className="w-[300px] md:w-[400px] lg:w-[450px] shrink-0"
              >
                <PaperCard
                  paper={paper}
                  featured={true}
                  index={index % featuredList.length}
                />
              </div>
            ))}
          </div>

          {/* Fade overlays for the "next card already visible" peek effect */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/papers"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                View All Research Papers
              </span>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
