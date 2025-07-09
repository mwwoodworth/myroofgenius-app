"use client";
import { ReactNode } from "react";
import { ThemeProvider, RoleProvider, ARModeProvider, ToastProvider, PresenceProvider } from '../ui';
import { AuthProvider } from '../../src/context/AuthContext';
import { LocaleProvider } from '../../src/context/LocaleContext';
import { CurrencyProvider } from '../../src/context/CurrencyContext';
import DocumentLang from '../DocumentLang';
import Navbar from '../Navbar';
import AnnouncementBanner from '../AnnouncementBanner';
import ErrorBoundary from '../ErrorBoundary';
import CopilotWrapper from './CopilotWrapper';
import AnimatedLayout from './AnimatedLayout';
import Footer from '../Footer';
import { aiCopilotEnabled, arModeEnabled } from '../../app/lib/features';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <CurrencyProvider>
        <DocumentLang />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only absolute top-0 left-0 z-50 bg-white text-black p-2"
        >
          Skip to Content
        </a>
        <AnimatedLayout>
          <AuthProvider>
            <RoleProvider>
              <ThemeProvider>
                <ToastProvider>
                  <PresenceProvider room="global">
                    {arModeEnabled ? (
                      <ARModeProvider>
                        <Navbar />
                        <AnnouncementBanner />
                        <main id="main-content" tabIndex={-1} className="outline-none">
                          <ErrorBoundary>{children}</ErrorBoundary>
                        </main>
                        {aiCopilotEnabled && <CopilotWrapper />}
                        <Footer />
                      </ARModeProvider>
                    ) : (
                      <>
                        <Navbar />
                        <AnnouncementBanner />
                        <main id="main-content" tabIndex={-1} className="outline-none">
                          <ErrorBoundary>{children}</ErrorBoundary>
                        </main>
                        {aiCopilotEnabled && <CopilotWrapper />}
                        <Footer />
                      </>
                    )}
                  </PresenceProvider>
                </ToastProvider>
              </ThemeProvider>
            </RoleProvider>
          </AuthProvider>
        </AnimatedLayout>
      </CurrencyProvider>
    </LocaleProvider>
  );
}
