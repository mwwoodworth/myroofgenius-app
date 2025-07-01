'use client';
import { useARMode } from './ARModeProvider';

export default function ARModeToggle() {
  const { enabled, toggle } = useARMode();
  return (
    <button
      onClick={toggle}
      className="ml-2 px-3 py-1.5 rounded-md bg-accent text-white text-sm"
    >
      {enabled ? 'Disable AR' : 'Enable AR'}
    </button>
  );
}
