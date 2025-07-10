import './globals.css';
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import dynamicImport from 'next/dynamic';
import './lib/sentry';
import { maintenanceMode } from './lib/features';
import { Analytics } from '../components/ui';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

const Starfield = dynamicImport(() => import('../components/Starfield'), { ssr: false });
const ClientLayout = dynamicImport(() => import('../components/layout/ClientLayout'), { ssr: false });

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const poppins = Poppins({ subsets: ['latin'], variable: '--font-heading' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const theme = `${inter.variable} ${poppins.variable} ${jetbrains.variable}`;

export const metadata = {
  title: 'MyRoofGenius - Smart Roofing Solutions',
  description: 'AI-powered roofing tools and marketplace',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={theme}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0d1b2a" />
        <link rel="icon" href="https://via.placeholder.com/192" sizes="192x192" />
        <link rel="apple-touch-icon" href="https://via.placeholder.com/512" sizes="512x512" />
        <link rel="icon" href="https://via.placeholder.com/1024" sizes="1024x1024" />
      </head>
      <body>
        {maintenanceMode ? (
          <div className="min-h-screen flex items-center justify-center">
            <p>Site is under maintenance. Please check back soon.</p>
          </div>
        ) : (
          <>
            <Starfield />
            <ClientLayout>{children}</ClientLayout>
            <Analytics />
            <VercelAnalytics />
          </>
        )}
      </body>
    </html>
  );
}
