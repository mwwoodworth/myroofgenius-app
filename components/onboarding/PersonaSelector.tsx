'use client';
import { motion } from 'framer-motion';
import { Calculator, Building, Ruler, HardHat } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

export type Persona = 'estimator' | 'owner' | 'architect' | 'contractor';

interface PersonaOption {
  id: Persona;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  benefits: string[];
}

interface PersonaSelectorProps {
  onSelect: (persona: Persona) => void;
}

const personas: PersonaOption[] = [
  {
    id: 'estimator',
    name: 'Estimator',
    description: 'I calculate costs and create accurate roofing estimates',
    icon: Calculator,
    benefits: [
      'AI-powered measurement tools',
      'Real-time pricing updates',
      'Automated proposal generation',
    ],
  },
  {
    id: 'owner',
    name: 'Building Owner',
    description: 'I manage properties and make roofing decisions',
    icon: Building,
    benefits: [
      'ROI calculations',
      'Maintenance scheduling',
      'Warranty tracking',
    ],
  },
  {
    id: 'architect',
    name: 'Architect',
    description: 'I design roofing systems and ensure compliance',
    icon: Ruler,
    benefits: [
      'Code compliance checks',
      'Material specifications',
      'Design collaboration tools',
    ],
  },
  {
    id: 'contractor',
    name: 'Contractor',
    description: 'I manage crews and execute roofing projects',
    icon: HardHat,
    benefits: [
      'Crew scheduling',
      'Progress tracking',
      'Field communication tools',
    ],
  },
];

export default function PersonaSelector({ onSelect }: PersonaSelectorProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="max-w-6xl w-full">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Welcome to MyRoofGenius</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Select your role to personalize your experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <motion.div key={persona.id} variants={itemVariants}>
                <GlassCard
                  className="p-8 cursor-pointer group h-full"
                  onClick={() => onSelect(persona.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors"
                      >
                        <Icon className="w-8 h-8 text-primary" />
                      </motion.div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-2">{persona.name}</h3>
                      <p className="text-text-secondary mb-4">{persona.description}</p>
                      <ul className="space-y-2">
                        {persona.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <motion.div
                    className="mt-6 flex justify-end"
                    whileHover={{ x: 5 }}
                  >
                    <GlassButton size="sm" variant="primary">
                      Continue as {persona.name} →
                    </GlassButton>
                  </motion.div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-sm text-text-muted">
            Not sure? You can change this later in settings.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}