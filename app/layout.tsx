import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import dynamicImport from 'next/dynamic';
import './lib/sentry';
import { maintenanceMode } from './lib/features';
import { Analytics } from '../components/ui';

const Starfield = dynamicImport(() => import('../components/Starfield'), { ssr: false });
const ClientLayout = dynamicImport(() => import('../components/layout/ClientLayout'), { ssr: false });

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MyRoofGenius - Smart Roofing Solutions',
  description: 'AI-powered roofing tools and marketplace',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  if (maintenanceMode) {
    return (
      <html lang="en" className="dark">
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center">
            <p>Site is under maintenance. Please check back soon.</p>
          </div>
        </body>
      </html>
    );
  }
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Starfield />
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
