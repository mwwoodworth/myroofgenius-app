'use client'
import { useState, useRef } from 'react';
import CopilotPanel from '../../../components/CopilotPanel';

export default function ProductQABtn({ name, description }: { name: string; description: string }) {
  const [open, setOpen] = useState(false);
  const promptRef = useRef(`You are a product specialist for ${name}. Use the following description to answer customer questions: ${description}`);
  return (
    <>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        AI Copilot Q&A
      </button>
      <CopilotPanel open={open} onClose={() => setOpen(false)} initialPrompt={promptRef.current} />
    </>
  );
}
