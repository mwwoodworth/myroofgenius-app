'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { generateOnboardingContent } from '../../lib/claude';
import { Persona } from './PersonaSelector';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

interface OnboardingStep {
  id: number;
  title: string;
  component: React.ComponentType<any>;
}

interface DynamicOnboardingProps {
  persona: Persona;
  onComplete: () => void;
}

export default function DynamicOnboarding({ persona, onComplete }: DynamicOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [aiContent, setAiContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<number, any>>({});

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Welcome',
      component: WelcomeStep,
    },
    {
      id: 2,
      title: 'Setup',
      component: SetupStep,
    },
    {
      id: 3,
      title: 'Preferences',
      component: PreferencesStep,
    },
  ];

  useEffect(() => {
    loadAIContent();
  }, [currentStep, persona]);

  const loadAIContent = async () => {
    setLoading(true);
    try {
      const content = await generateOnboardingContent(persona, currentStep + 1);
      setAiContent(content);
    } catch (error) {
      console.error('Failed to load AI content:', error);
      setAiContent(getDefaultContent(persona, currentStep + 1));
    }
    setLoading(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: index === currentStep ? 1.2 : 1,
                    backgroundColor:
                      index <= currentStep
                        ? 'rgb(var(--clr-primary))'
                        : 'rgb(var(--clr-primary) / 0.2)',
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <motion.div
                      initial={false}
                      animate={{
                        scaleX: index < currentStep ? 1 : 0,
                      }}
                      className="h-1 bg-primary origin-left"
                      style={{
                        transformOrigin: 'left center',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            {steps.map((step) => (
              <span key={step.id}>{step.title}</span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring' as const, stiffness: 100 }}
          >
            <GlassCard className="p-8">
              <CurrentStepComponent
                persona={persona}
                aiContent={aiContent}
                loading={loading}
                responses={responses}
                onResponse={(data: any) =>
                  setResponses({ ...responses, [currentStep]: data })
                }
              />
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <GlassButton
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </GlassButton>
          <GlassButton variant="primary" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ persona, aiContent, loading }: any) {
  return (
    <div className="text-center py-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-4"
      >
        Welcome, {persona.charAt(0).toUpperCase() + persona.slice(1)}!
      </motion.h2>
      {loading ? (
        <div className="animate-pulse h-20 bg-white/5 rounded-lg" />
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-text-secondary leading-relaxed"
        >
          {aiContent}
        </motion.p>
      )}
    </div>
  );
}

function SetupStep({ persona, aiContent, loading, onResponse }: any) {
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('');

  useEffect(() => {
    onResponse({ companyName, teamSize });
  }, [companyName, teamSize]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Let's set up your workspace</h2>
      {loading ? (
        <div className="animate-pulse h-16 bg-white/5 rounded-lg" />
      ) : (
        <p className="text-text-secondary">{aiContent}</p>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="glass-input w-full"
            placeholder="Enter your company name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Team Size</label>
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            className="glass-input w-full"
          >
            <option value="">Select team size</option>
            <option value="solo">Just me</option>
            <option value="small">2-5 people</option>
            <option value="medium">6-20 people</option>
            <option value="large">20+ people</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PreferencesStep({ persona, aiContent, loading, onResponse }: any) {
  const [preferences, setPreferences] = useState({
    notifications: true,
    aiAssistance: true,
    dataSharing: false,
  });

  useEffect(() => {
    onResponse(preferences);
  }, [preferences]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customize your experience</h2>
      {loading ? (
        <div className="animate-pulse h-16 bg-white/5 rounded-lg" />
      ) : (
        <p className="text-text-secondary">{aiContent}</p>
      )}
      <div className="space-y-4">
        {Object.entries({
          notifications: 'Email notifications for important updates',
          aiAssistance: 'AI-powered suggestions and automation',
          dataSharing: 'Share anonymous usage data to improve the product',
        }).map(([key, label]) => (
          <label key={key} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences[key as keyof typeof preferences]}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  [key]: e.target.checked,
                })
              }
              className="w-5 h-5 rounded border-glass-border bg-glass text-primary focus:ring-primary"
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Fallback content if AI fails
function getDefaultContent(persona: string, step: number): string {
  const defaultContent = {
    estimator: {
      1: "Welcome to MyRoofGenius! You're about to transform how you create roofing estimates with AI-powered accuracy.",
      2: "Let's get your workspace configured for maximum estimation efficiency.",
      3: "Choose your preferences to optimize your estimation workflow.",
    },
    owner: {
      1: "Welcome! MyRoofGenius helps you make informed roofing decisions and protect your investment.",
      2: "Let's set up your property management dashboard.",
      3: "Customize how you receive updates about your properties.",
    },
    architect: {
      1: "Welcome! MyRoofGenius streamlines your roofing design and specification process.",
      2: "Let's configure your design workspace.",
      3: "Set your preferences for collaboration and compliance tools.",
    },
    contractor: {
      1: "Welcome! MyRoofGenius helps you manage crews and projects more efficiently.",
      2: "Let's set up your project management tools.",
      3: "Configure your field communication preferences.",
    },
  };

  return defaultContent[persona]?.[step] || "Let's continue setting up your account.";
}