'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeTour() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const steps = [
    'Welcome to your roofing intelligence HQ',
    'Run a quick demo analysis',
    'Configure your first project'
  ];

  if (!user) return null;

  return (
    <div className="p-6 bg-white/10 rounded">
      <p className="mb-4">{steps[step]}</p>
      {step < steps.length - 1 ? (
        <button className="px-4 py-2 bg-secondary-700 text-white rounded" onClick={() => setStep(step + 1)}>Next</button>
      ) : (
        <button className="px-4 py-2 bg-accent-emerald text-white rounded" onClick={() => setStep(0)}>Finish</button>
      )}
    </div>
  );
}
