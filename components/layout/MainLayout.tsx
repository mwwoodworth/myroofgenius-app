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
          background: linear-gradient(-45deg, #121212, #0d1d31, #1E90FF, #005f73);
          background-size: 400% 400%;
          animation: gradient 25s ease infinite;
          color: #F0F0F0;
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
