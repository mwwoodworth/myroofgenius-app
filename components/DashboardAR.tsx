'use client';
import { useARMode } from './ui/ARModeProvider';
import Dashboard3D from './Dashboard3D';

export default function DashboardAR() {
  const { enabled } = useARMode();
  if (!enabled) return null;
  return <Dashboard3D />;
}
