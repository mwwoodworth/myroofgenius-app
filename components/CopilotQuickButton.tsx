"use client";
import { useState } from "react";
import { CopilotSidebar, CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

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
      <CopilotSidebar
        defaultOpen={open}
        onSetOpen={setOpen}
        labels={{ title: "AI Helper", initial: prompt || "Ask a question" }}
        className="copilot-panel"
      >
        <CopilotChat instructions={prompt} />
      </CopilotSidebar>
    </>
  );
}
