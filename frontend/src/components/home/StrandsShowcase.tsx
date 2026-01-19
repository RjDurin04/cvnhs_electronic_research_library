import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { Strand } from '@/types/strand';
import { IconRenderer } from '@/components/common/IconRenderer';

export const StrandsShowcase: React.FC = () => {
  const [strands, setStrands] = useState<Strand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStrands = async () => {
      try {
        const res = await fetch('/api/strands');
        if (res.ok) {
          const data = await res.json();
          setStrands(data);
        }
      } catch (error) {
        console.error('Failed to fetch strands:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrands();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Browse by Strand
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Explore research papers organized by academic tracks
            </p>
          </div>
          <Link
            to="/strands"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            View all strands
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex overflow-x-auto overflow-y-hidden no-scrollbar pb-6 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-5 gap-4 lg:gap-6">
          {strands.map((strand, index) => (
            <motion.div
              key={strand._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-shrink-0 w-[280px] lg:w-auto"
            >
              <Link
                to={`/papers?strand=${strand.short}`}
                className="block h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <IconRenderer iconName={strand.icon} className="w-8 h-8" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-extrabold text-primary">
                    {strand.short}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    • {strand.paperCount || 0} papers
                  </span>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 line-clamp-2">
                  {strand.name}
                </h3>
                <p className="text-sm text-muted-foreground/70 line-clamp-2 mb-4">
                  {strand.description}
                </p>
                <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Explore</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

