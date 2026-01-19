import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Strand } from '@/types/strand';
import { IconRenderer } from '@/components/common/IconRenderer';

const StrandsPage: React.FC = () => {
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
      <div className="min-h-screen py-10 lg:py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-3">Academic Strands</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore research papers organized by Senior High School academic tracks
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {strands.map((strand, i) => (
            <motion.div key={strand._id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Link to={`/papers?strand=${strand.short}`} className="block p-5 md:p-6 lg:p-8 rounded-3xl bg-card border border-border hover:border-primary/30 shadow-card hover:shadow-card-hover transition-all duration-300 group h-full">
                <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-primary/5 text-primary">
                  <IconRenderer iconName={strand.icon} className="w-10 h-10" />
                </div>
                <div className="flex items-baseline gap-2 mb-2 md:mb-3">
                  <span className="text-2xl md:text-3xl font-extrabold text-primary">{strand.short}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">{strand.paperCount || 0} papers</span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">{strand.name}</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 line-clamp-3">{strand.description}</p>
                <span className="inline-flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  Browse papers <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrandsPage;
