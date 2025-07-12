'use client';
import { aiCopilotEnabled } from '../../app/lib/features';
import { ChatWidget } from '../ui';

export default function CopilotWrapper() {
  if (!aiCopilotEnabled) return null;
  return <ChatWidget />;
}
