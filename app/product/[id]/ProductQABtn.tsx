'use client'
import { useState, useRef } from 'react';
import { CopilotSidebar, CopilotChat } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

export default function ProductQABtn({ name, description }: { name: string; description: string }) {
  const [open, setOpen] = useState(false);
  const promptRef = useRef(`You are a product specialist for ${name}. Use the following description to answer customer questions: ${description}`);
  return (
    <>
      <button
        className="mt-4 px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-700/80"
        onClick={() => setOpen(true)}
      >
        AI Copilot Q&A
      </button>
      <CopilotSidebar
        defaultOpen={open}
        onSetOpen={setOpen}
        labels={{ title: 'Product Q&A', initial: promptRef.current }}
        className="copilot-panel"
      >
        <CopilotChat instructions={promptRef.current} />
      </CopilotSidebar>
    </>
  );
}
