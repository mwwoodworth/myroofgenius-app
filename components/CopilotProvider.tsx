"use client";
import { CopilotKit } from "@copilotkit/react-core";
import type { ReactNode } from "react";

export default function CopilotProvider({ children }: { children: ReactNode }) {
  return <CopilotKit runtimeUrl="/api/copilot">{children}</CopilotKit>;
}

