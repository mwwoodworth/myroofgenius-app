'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';
import { motion } from 'framer-motion';

export default function GetStarted() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (onboardingComplete === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleGetStarted = () => {
    // Check if user is logged in (placeholder - integrate with your auth)
    const isLoggedIn = false; // TODO: Check actual auth state
    
    if (isLoggedIn) {
      router.push('/onboarding');
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full"
      >
        <GlassCard className="p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Start Your Journey</span>
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            Experience AI-powered roofing intelligence tailored to your role
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <span className="text-left">Personalized onboarding for your role</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤖</span>
              <span className="text-left">AI assistant trained on your needs</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <span className="text-left">Custom dashboard and workflows</span>
            </div>
          </div>

          <GlassButton
            size="lg"
            variant="primary"
            onClick={handleGetStarted}
            className="w-full mb-4"
          >
            Get Started Free
          </GlassButton>
          
          <p className="text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
