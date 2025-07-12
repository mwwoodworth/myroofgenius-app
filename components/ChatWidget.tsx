'use client';
import { useState, useEffect } from 'react';
import CopilotPanel from './CopilotPanel';
import { MessageCircle } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [engine, setEngine] = useState('GPT');
  const [prompt, setPrompt] = useState('Need help analyzing?');
  useEffect(() => {
    const saved = localStorage.getItem('aiEngine');
    if (saved) setEngine(saved);
    const ins = localStorage.getItem('aiInstructions');
    if (ins) setPrompt(ins);
    const pagePrompt = document.body.dataset.pagePrompt;
    if (pagePrompt) setPrompt(pagePrompt);
  }, []);
  useEffect(() => {
    localStorage.setItem('aiEngine', engine);
  }, [engine]);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-accent text-white flex items-center justify-center shadow-lg hover:scale-110 transition animate-bounce"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">Ask AI</span>
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 bg-bg-card rounded-lg shadow-md p-2 text-sm flex items-center gap-2">
          <span>{engine}</span>
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="bg-transparent focus:outline-none"
          >
            <option value="Claude">Claude</option>
            <option value="Gemini">Gemini</option>
            <option value="GPT">GPT</option>
          </select>
        </div>
      )}
      <CopilotPanel open={open} onClose={() => setOpen(false)} initialPrompt={prompt} />
    </>
  );
}
