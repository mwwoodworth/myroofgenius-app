'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Role = 'pm' | 'exec' | 'field'
interface RoleCtx {
  role: Role
  setRole: (r: Role) => void
}

const RoleContext = createContext<RoleCtx>({ role: 'pm', setRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('pm');

  useEffect(() => {
    const stored = localStorage.getItem('role') as Role | null;
    if (stored) setRole(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('role', role);
  }, [role]);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
