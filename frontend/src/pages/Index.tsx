import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedPapers } from '@/components/home/FeaturedPapers';
import { StrandsShowcase } from '@/components/home/StrandsShowcase';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <FeaturedPapers />
      <StrandsShowcase />
    </div>
  );
};

export default HomePage;
