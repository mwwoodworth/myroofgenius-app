import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'MyRoofGenius',
  description: 'AI‑powered roofing intelligence platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">{children}</body>
    </html>
  );
}
