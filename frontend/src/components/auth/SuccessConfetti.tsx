import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

interface SuccessConfettiProps {
  isActive: boolean;
}

export const SuccessConfetti: React.FC<SuccessConfettiProps> = ({ isActive }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      const colors = ['#14b8a6', '#0d9488', '#10b981', '#ffffff', '#5eead4'];
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: i,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 6,
          rotation: Math.random() * 360,
          velocityX: (Math.random() - 0.5) * 150,
          velocityY: -100 - Math.random() * 100,
        });
      }
      
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 1500);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            scale: 1,
            rotate: particle.rotation,
            opacity: 1,
          }}
          animate={{
            x: `calc(${particle.x}% + ${particle.velocityX}px)`,
            y: `calc(${particle.y}% + ${particle.velocityY + 200}px)`,
            scale: 0,
            rotate: particle.rotation + 360,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="absolute pointer-events-none z-50"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </AnimatePresence>
  );
};
