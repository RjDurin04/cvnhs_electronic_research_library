import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import { ResearchPaper } from '@/types/paper';

interface PaperCardProps {
  paper: ResearchPaper;
  featured?: boolean;
  compact?: boolean;
  index?: number;
}

// Strand color mapping for unique visual identity
const strandColors: Record<string, { bg: string; text: string; glow: string; gradient: string }> = {
  STEM: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/20',
    gradient: 'from-emerald-500/20 via-transparent to-transparent',
  },
  ABM: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
    gradient: 'from-amber-500/20 via-transparent to-transparent',
  },
  HUMSS: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'group-hover:shadow-rose-500/20',
    gradient: 'from-rose-500/20 via-transparent to-transparent',
  },
  GAS: {
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    glow: 'group-hover:shadow-sky-500/20',
    gradient: 'from-sky-500/20 via-transparent to-transparent',
  },
  TVL: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    glow: 'group-hover:shadow-violet-500/20',
    gradient: 'from-violet-500/20 via-transparent to-transparent',
  },
  'Arts & Design': {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    text: 'text-pink-600 dark:text-pink-400',
    glow: 'group-hover:shadow-pink-500/20',
    gradient: 'from-pink-500/20 via-transparent to-transparent',
  },
};

const getStrandStyle = (strand: string) => {
  return strandColors[strand] || {
    bg: 'bg-primary/10',
    text: 'text-primary',
    glow: 'group-hover:shadow-primary/20',
    gradient: 'from-primary/20 via-transparent to-transparent',
  };
};

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  featured = false,
  compact = false,
  index = 0,
}) => {
  const strandStyle = getStrandStyle(paper.strand);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Compact card for bottom row
  if (compact) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="h-full"
        style={{ willChange: 'transform, opacity' }}
      >
        <Link
          to={`/papers/${paper.id}`}
          className={`group relative block h-full p-4 md:p-6 rounded-2xl bg-card/80 dark:bg-card/60 border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden ${strandStyle.glow} hover:shadow-xl`}
        >
          {/* Subtle gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${strandStyle.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${strandStyle.bg} ${strandStyle.text}`}>
                <Sparkles className="w-3 h-3" />
                {paper.strand}
              </span>
              <span className="text-xs text-muted-foreground font-medium">{paper.school_year}</span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2 md:mb-3">
              {paper.title}
            </h3>

            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3 md:mb-4">
              {paper.abstract.length > 150
                ? `${paper.abstract.substring(0, 150)}...`
                : paper.abstract}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Download className="w-3.5 h-3.5" />
                {paper.download_count}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Read
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Featured card - hero style
  if (featured) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="group relative h-full"
        style={{ willChange: 'transform, opacity' }}
      >
        <Link
          to={`/papers/${paper.id}`}
          className={`relative block h-full rounded-3xl bg-card/80 dark:bg-card/60 border border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden ${strandStyle.glow} hover:shadow-xl`}
        >
          {/* Multi-layer background effects */}
          <div className="absolute inset-0">
            {/* Gradient mesh */}
            <div className={`absolute inset-0 bg-gradient-to-br ${strandStyle.gradient} opacity-40`} />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card to-transparent" />

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full" />
          </div>

          <div className="relative h-full p-5 md:p-6 lg:p-7 flex flex-col">
            <div className="flex-1">
              {/* Header: Strand & Year */}
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-wider uppercase border border-current bg-transparent ${strandStyle.text}`}>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-2.5 h-2.5 md:w-3 h-3" />
                    {paper.strand}
                  </div>
                </span>
                <span className="text-[10px] md:text-xs font-semibold text-muted-foreground/80 tracking-wide">
                  {paper.school_year}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-2 md:mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {paper.title}
              </h3>

              {/* Authors */}
              <p className="text-xs md:text-sm font-semibold text-primary/90 mb-2 md:mb-3 line-clamp-1">
                {paper.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
              </p>

              {/* Abstract */}
              <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground leading-relaxed mb-3 md:mb-4 line-clamp-3">
                {paper.abstract.length > 150
                  ? `${paper.abstract.substring(0, 150)}...`
                  : paper.abstract}
              </p>

              {/* Keywords as modern pills */}
              <div className="flex flex-wrap gap-1.5 mb-3 md:mb-4">
                {paper.keywords.slice(0, 3).map((keyword, idx) => (
                  <motion.span
                    key={keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="px-2 py-0.5 md:py-1 rounded-lg bg-secondary/60 dark:bg-secondary/40 text-secondary-foreground text-[9px] md:text-[10px] font-medium border border-border/20"
                  >
                    {keyword}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/30">
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-xs">{paper.download_count}</span>
                  <span className="text-[10px]">downloads</span>
                </span>
              </div>

              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Read Paper
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default card style
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="h-full"
    >
      <Link
        to={`/papers/${paper.id}`}
        className={`group relative block h-full rounded-2xl bg-card/50 dark:bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden ${strandStyle.glow} hover:shadow-xl hover:-translate-y-1`}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${strandStyle.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="relative z-10 p-4 md:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${strandStyle.bg} ${strandStyle.text}`}>
              {paper.strand}
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground">{paper.school_year}</span>
          </div>

          <h3 className="text-base md:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-1.5 md:mb-2">
            {paper.title}
          </h3>

          <p className="text-xs md:text-sm text-primary/70 font-medium mb-1.5 md:mb-2">
            {paper.authors.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
          </p>

          <p className="text-[11px] md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3 mb-3 md:mb-4 flex-grow">
            {paper.abstract.length > 150
              ? `${paper.abstract.substring(0, 150)}...`
              : paper.abstract}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Download className="w-3.5 h-3.5" />
              {paper.download_count}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
              Read
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
