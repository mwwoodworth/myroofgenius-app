"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { useCopilotReadable } from "@copilotkit/react-core";
import CopilotPanel from "./CopilotPanel";
import { useAuth } from "../src/context/AuthContext";

export default function ChatWidgetInner() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Provide context info to CopilotKit
  useCopilotReadable({ description: "Current path", value: pathname });
  useCopilotReadable({ description: "User info", value: user });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 bg-accent text-white flex items-center justify-center shadow-md hover:scale-105 transition transform animate-pulse ring-2 ring-accent/40"
      >
        <Bot className="w-5 h-5" />
        <span className="sr-only">RoofGenius AI</span>
      </button>
      <CopilotPanel 
        open={open}
        onClose={() => setOpen(false)}
        initialPrompt="Need help with your roof? I'm here to assist with estimations, materials, or any roofing questions."
      />
    </>
  );
}
