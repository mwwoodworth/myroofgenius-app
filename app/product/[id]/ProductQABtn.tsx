'use client'
import { useState } from 'react';
import CopilotPanel from '../../../components/CopilotPanel';

export default function ProductQABtn({ name, description }: { name: string; description: string }) {
  const [open, setOpen] = useState(false);
  const initialPrompt = `Tell me more about ${name}. ${description}`;
  
  return (
    <>
      <button
        className="mt-4 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-700/80"
        onClick={() => setOpen(true)}
      >
        AI Copilot Q&A
      </button>
      <CopilotPanel 
        open={open} 
        onClose={() => setOpen(false)}
        initialPrompt={initialPrompt}
      />
    </>
  );
}
