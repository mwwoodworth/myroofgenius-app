import React from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import '@copilotkit/react-ui/styles.css';

export default function CopilotProvider({ children }) {
  return <CopilotKit runtimeUrl="/api/copilot">{children}</CopilotKit>;
}
