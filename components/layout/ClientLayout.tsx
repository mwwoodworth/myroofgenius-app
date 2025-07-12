"use client";
import { ReactNode, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  ThemeProvider,
  RoleProvider,
  ARModeProvider,
  ToastProvider,
  PresenceProvider,
} from "../ui";
import { AuthProvider } from "../../src/context/AuthContext";
import { LocaleProvider } from "../../src/context/LocaleContext";
import { CurrencyProvider } from "../../src/context/CurrencyContext";
import DocumentLang from "../DocumentLang";
import NavBar from "../NavBar";
import Breadcrumbs from "../Breadcrumbs";
import AnnouncementBanner from "../AnnouncementBanner";
import ErrorBoundary from "../ErrorBoundary";
import CopilotWrapper from "./CopilotWrapper";
import AnimatedLayout from "./AnimatedLayout";
import Footer from "../Footer";
import { aiCopilotEnabled, arModeEnabled } from "../../app/lib/features";

export default function ClientLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  useEffect(() => {
    const promptHandler = (e: any) => {
      e.preventDefault();
      e.prompt();
    };
    window.addEventListener("beforeinstallprompt", promptHandler);
    return () =>
      window.removeEventListener("beforeinstallprompt", promptHandler);
  }, []);

  const pathname = usePathname();
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
        <AnimatePresence mode="wait">
          <AnimatedLayout key={pathname}>
            <AuthProvider>
              <RoleProvider>
                <ThemeProvider>
                  <ToastProvider>
                    <PresenceProvider room="global">
                      {arModeEnabled ? (
                        <ARModeProvider>
                          <NavBar />
                          <Breadcrumbs />
                          <AnnouncementBanner />
                          <main
                            id="main-content"
                            tabIndex={-1}
                            className="outline-none pb-24"
                          >
                            <ErrorBoundary>{children}</ErrorBoundary>
                          </main>
                          {aiCopilotEnabled && <CopilotWrapper />}
                          <Footer />
                        </ARModeProvider>
                      ) : (
                        <>
                          <NavBar />
                          <Breadcrumbs />
                          <AnnouncementBanner />
                          <main
                            id="main-content"
                            tabIndex={-1}
                            className="outline-none pb-24"
                          >
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
        </AnimatePresence>
      </CurrencyProvider>
    </LocaleProvider>
  );
}
