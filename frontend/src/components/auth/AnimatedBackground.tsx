import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrame: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles = [];
      const density = (canvas.width * canvas.height) / 12000;
      for (let i = 0; i < density; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const opacity = (1 - dist / 180) * 0.15;
            ctx.strokeStyle = `rgba(20, 184, 166, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach(p => {
        ctx.fillStyle = `rgba(45, 212, 191, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Mouse interaction
        if (mouseRef.current.active) {
          const mdx = p.x - mouseRef.current.x;
          const mdy = p.y - mouseRef.current.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 250) {
            const force = (250 - mdist) / 250;
            p.x += mdx * force * 0.015;
            p.y += mdy * force * 0.015;
          }
        }

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animationFrame = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#f8fafc] overflow-hidden">
      {/* Mesh Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/30 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-teal-100/40 blur-[100px] rounded-full" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[20%] right-[15%] w-[25%] h-[25%] bg-slate-200/40 blur-[90px] rounded-full" />

      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40" />
    </div>
  );
};
