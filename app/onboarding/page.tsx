'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PersonaSelector, { Persona } from '../../components/onboarding/PersonaSelector';
import DynamicOnboarding from '../../components/onboarding/DynamicOnboarding';
import { useRole } from '../../components/ui/RoleProvider';

export default function OnboardingPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    // Map personas to roles for the RoleProvider
    const roleMap = {
      estimator: 'field',
      owner: 'exec',
      architect: 'pm',
      contractor: 'field',
    };
    setRole(roleMap[persona] as any);
  };

  const handleComplete = () => {
    // Save onboarding completion
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userPersona', selectedPersona!);
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  if (!selectedPersona) {
    return <PersonaSelector onSelect={handlePersonaSelect} />;
  }

  return (
    <DynamicOnboarding 
      persona={selectedPersona} 
      onComplete={handleComplete} 
    />
  );
}