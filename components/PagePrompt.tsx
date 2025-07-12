'use client';
import { useEffect } from 'react';
export default function PagePrompt({ prompt }: { prompt: string }) {
  useEffect(() => {
    document.body.dataset.pagePrompt = prompt;
    return () => {
      delete document.body.dataset.pagePrompt;
    };
  }, [prompt]);
  return null;
}
