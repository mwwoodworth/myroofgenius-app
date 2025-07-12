"use client";
import { useState, useEffect } from "react";
import CopilotPanel from "./CopilotPanel";
import { Bot } from "lucide-react";
import TypingText from "./ui/TypingText";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [engine, setEngine] = useState("GPT");
  const [prompt, setPrompt] = useState("Need help with your roof?");
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("aiEngine");
    if (saved) setEngine(saved);
    const ins = localStorage.getItem("aiInstructions");
    if (ins) setPrompt(ins);
    const pagePrompt = document.body.dataset.pagePrompt;
    if (pagePrompt) setPrompt(pagePrompt);
    if (!localStorage.getItem("aiIntroShown")) {
      setShowIntro(true);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("aiEngine", engine);
  }, [engine]);

  const handleOpen = () => {
    setOpen(true);
    localStorage.setItem("aiIntroShown", "true");
    setShowIntro(false);
  };
  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 bg-accent text-white flex items-center justify-center shadow-md hover:scale-105 transition animate-pulse ring-2 ring-accent/40"
      >
        <Bot className="w-5 h-5" />
        <span className="sr-only">RoofGenius AI</span>
      </button>
      {showIntro && (
        <div className="fixed bottom-20 right-6 bg-bg-card rounded-lg shadow p-3">
          <TypingText
            texts={[
              "Welcome to RoofGenius AI! Ask me anything about roofing.",
              'Try "Estimate material costs"',
            ]}
            className="text-sm text-text-primary"
          />
        </div>
      )}
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
      <CopilotPanel
        open={open}
        onClose={() => setOpen(false)}
        initialPrompt={prompt}
      />
    </>
  );
}
