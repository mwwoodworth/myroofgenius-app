'use client';
import { motion } from 'framer-motion';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';

interface AnimatedHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export default function AnimatedHero({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
}: AnimatedHeroProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 animated-gradient opacity-20" />
      
      {/* Floating glass shapes */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-10 w-64 h-64 glass rounded-full opacity-20"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-20 right-10 w-96 h-96 glass rounded-full opacity-20"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 py-20 relative z-10"
      >
        <div className="max-w-4xl mx-auto text-center">
          {subtitle && (
            <motion.div variants={itemVariants} className="mb-4">
              <span className="text-accent text-sm font-semibold tracking-wide uppercase">
                {subtitle}
              </span>
            </motion.div>
          )}

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="gradient-text">{title}</span>
          </motion.h1>

          {description && (
            <motion.p
              variants={itemVariants}
              className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto"
            >
              {description}
            </motion.p>
          )}

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {primaryAction && (
              <GlassButton size="lg" variant="primary">
                {primaryAction.label}
              </GlassButton>
            )}
            {secondaryAction && (
              <GlassButton size="lg" variant="secondary">
                {secondaryAction.label}
              </GlassButton>
            )}
          </motion.div>

          {/* Feature cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
          >
            {['AI-Powered Analysis', 'Real-time Collaboration', 'Smart Insights'].map((feature, index) => (
              <GlassCard key={feature} className="p-6 text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <span className="text-2xl">✨</span>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{feature}</h3>
                <p className="text-sm text-text-secondary">
                  Experience next-generation roofing intelligence.
                </p>
              </GlassCard>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}