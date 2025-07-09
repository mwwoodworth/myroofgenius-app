"use client";
import { useState } from "react";
import CopilotPanel from "./CopilotPanel";

export default function CopilotQuickButton({ prompt }: { prompt?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="px-4 py-2 bg-accent text-white rounded-lg shadow hover:bg-accent/80"
        onClick={() => setOpen(true)}
      >
        Ask AI
      </button>
      <CopilotPanel
        open={open}
        onClose={() => setOpen(false)}
        initialPrompt={prompt}
      />
    </>
  );
}
