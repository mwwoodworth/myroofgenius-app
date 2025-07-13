"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { useCopilotReadable } from "@copilotkit/react-core";
import { CopilotSidebar, CopilotChat } from "@copilotkit/react-ui";
import { useAuth } from "../src/context/AuthContext";
import "@copilotkit/react-ui/styles.css";

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
      <CopilotSidebar
        defaultOpen={open}
        onSetOpen={setOpen}
        className="copilot-panel"
        labels={{ title: "RoofGenius AI", initial: "Need help with your roof?" }}
      >
        <CopilotChat />
      </CopilotSidebar>
    </>
  );
}
