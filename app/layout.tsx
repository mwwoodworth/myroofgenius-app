import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider, RoleProvider, RoleSwitcher, ARModeProvider } from '../components/ui';
import type { ReactNode } from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { LocaleProvider } from '../src/context/LocaleContext';
import { CurrencyProvider } from '../src/context/CurrencyContext';
import DocumentLang from '../components/DocumentLang';
import Navbar from '../components/Navbar';
import AnnouncementBanner from '../components/AnnouncementBanner';
import ErrorBoundary from '../components/ErrorBoundary';
import CopilotWrapper from '../components/layout/CopilotWrapper';
import dynamicImport from 'next/dynamic';
const Starfield = dynamicImport(() => import('../components/Starfield'), { ssr: false });
import './lib/sentry';
import { maintenanceMode, aiCopilotEnabled, arModeEnabled } from './lib/features';

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
        <LocaleProvider>
        <CurrencyProvider>
        <DocumentLang />
        <div className="bg-bg min-h-screen text-text-primary font-inter">
          <AuthProvider>
          <RoleProvider>
            <ThemeProvider>
              {arModeEnabled ? (
                <ARModeProvider>
                  <Navbar />
                  <AnnouncementBanner />
                  <RoleSwitcher />
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                  {aiCopilotEnabled && <CopilotWrapper />}
                </ARModeProvider>
              ) : (
                <>
                  <Navbar />
                  <AnnouncementBanner />
                  <RoleSwitcher />
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                  {aiCopilotEnabled && <CopilotWrapper />}
                </>
              )}
            </ThemeProvider>
          </RoleProvider>
          </AuthProvider>
        </div>
        </CurrencyProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
