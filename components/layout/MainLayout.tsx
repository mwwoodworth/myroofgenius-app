'use client';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <style jsx global>{`
        body {
          background: linear-gradient(
            -45deg,
            var(--color-navy-900),
            var(--color-slate-700),
            var(--color-primary),
            var(--color-navy-900)
          ); /* replaced hex gradient with design tokens */
          background-size: 400% 400%;
          animation: gradient 25s ease infinite;
          color: var(--color-cloud-100); /* replaced hex with cloud-100 token */
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <main className="min-h-screen font-sans">{children}</main>
    </>
  );
}
