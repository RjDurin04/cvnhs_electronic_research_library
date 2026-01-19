import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Target, ShieldCheck, Sparkles } from 'lucide-react';
import schoolLogo from '@/assets/images/logo.jpg';

const AboutPage: React.FC = () => {
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

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12 md:space-y-20"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-[1.5rem] md:rounded-[2rem] bg-white flex items-center justify-center mb-6 md:mb-8 shadow-2xl shadow-primary/20 ring-4 ring-primary/10 overflow-hidden p-1.5"
            >
              <img src={schoolLogo} alt="CVNHS Logo" className="w-full h-full object-contain" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4 md:mb-6">
              About the <span className="text-primary italic">Library</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              An internal digital archive dedicated to preserving and managing the academic research legacy of
              <span className="text-foreground font-semibold"> Catubig Valley National High School</span>.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {[
              {
                icon: BookOpen,
                title: 'School Archive',
                desc: 'A private institution repository designed to archive and organize senior high school research papers for academic reference.',
                color: 'bg-blue-500/10 text-blue-500'
              },
              {
                icon: ShieldCheck,
                title: 'Internal Use',
                desc: 'Access is restricted to the CVNHS academic community. This system is intended for school-based research and internal circulation.',
                color: 'bg-emerald-500/10 text-emerald-500'
              },
              {
                icon: Target,
                title: 'Institutional Goal',
                desc: 'To provide students and faculty with a structured database to access previous studies and build upon institutional knowledge.',
                color: 'bg-purple-500/10 text-purple-500'
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-card/50 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${item.color} flex items-center justify-center mb-5 md:mb-6 shadow-inner`}>
                  <item.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic line-clamp-4 group-hover:text-foreground/80 transition-colors">{item.desc}</p>

                {/* Decorative background number */}
                <span className="absolute top-4 right-6 md:top-6 md:right-8 text-5xl md:text-7xl font-black text-foreground/[0.03] select-none">
                  0{i + 1}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Secondary Info Section */}
          <motion.div
            variants={itemVariants}
            className="rounded-[2rem] md:rounded-[3rem] bg-primary/5 border border-primary/10 p-6 sm:p-10 md:p-12 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
              <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-primary" />
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-foreground">Archiving Excellence</h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  The CVNHS Research Archive is more than just a library; it is a repository of student innovation.
                  By meticulously documenting research projects across various academic strands, we
                  create a roadmap for future generations of students to follow.
                </p>

                {/* Responsive Stat Bar */}
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-6 pt-4">
                  <div className="flex flex-col items-center lg:items-start min-w-[80px]">
                    <span className="text-xl md:text-2xl font-black text-primary">Reliable</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Storage</span>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-border" />
                  <div className="flex flex-col items-center lg:items-start min-w-[80px]">
                    <span className="text-xl md:text-2xl font-black text-primary">Secure</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Access</span>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-border" />
                  <div className="flex flex-col items-center lg:items-start min-w-[80px]">
                    <span className="text-xl md:text-2xl font-black text-primary">Organized</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Database</span>
                  </div>
                </div>
              </div>

              <div className="bg-card/30 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-border/50">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground uppercase tracking-tight text-xs md:text-sm">Community Guidelines</h4>
                </div>
                <ul className="space-y-3 md:space-y-4">
                  {[
                    'Respect intellectual property rights.',
                    'Use archived papers for reference only.',
                    'Maintain the confidentiality of student data.',
                    'Build upon existing research ethically.'
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
