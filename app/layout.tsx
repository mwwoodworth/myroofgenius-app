import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./lib/sentry";
import { maintenanceMode } from "./lib/features";
import { constructMetadata } from "./lib/metadata";

// If you use TrustSection or Testimonials on every page, import here too

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});
const theme = `${inter.variable} ${jetbrains.variable}`;

export const metadata = constructMetadata();

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { default: CopilotProvider } = await import("../components/CopilotProvider");
  const { default: Header } = await import("../components/Header");
  const { default: StickyMobileCTA } = await import("../components/ui/StickyMobileCTA");
  const { default: Starfield } = await import("../components/Starfield");
  const { default: PageTransitionWrapper } = await import("../components/PageTransitionWrapper");
  const { default: ClientLayout } = await import("../components/layout/ClientLayout");
  const { default: Analytics } = await import("../components/Analytics");
  const { Analytics: VercelAnalytics } = await import("@vercel/analytics/react");
  const { default: SkipToContent } = await import("../components/SkipToContent");
  const { default: PWARegistration } = await import("../components/PWARegistration");
  const { default: PWAInstallPrompt } = await import("../components/PWAInstallPrompt");
  const { default: AccessibilityPanel } = await import("../components/AccessibilityPanel");
  const { ToastProvider } = await import("../design-system/components/Toast");
  return (
    <html lang="en" className={theme}>
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* SEO, OG, and PWA meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0a192f" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon" />
        {/* --- JSON-LD and FAQ Structured Data (unchanged from your version) --- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MyRoofGenius',
              url: 'https://myroofgenius.com',
              logo: 'https://myroofgenius.com/logo.png',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'MyRoofGenius Roofing Services',
              image: 'https://myroofgenius.com/logo.png',
              telephone: '+1-555-555-5555',
              priceRange: '$$',
              areaServed: ['Denver', 'Boulder', 'Colorado Springs'],
              address: {
                '@type': 'PostalAddress',
                streetAddress: '100 Main St',
                addressLocality: 'Denver',
                addressRegion: 'CO',
                postalCode: '80202',
                addressCountry: 'US',
              },
              url: 'https://myroofgenius.com',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              serviceType: 'Roof Inspection',
              provider: { '@type': 'LocalBusiness', name: 'MyRoofGenius' },
              areaServed: ['Denver', 'Boulder', 'Colorado Springs'],
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Review',
              author: 'Jane Contractor',
              datePublished: '2024-01-02',
              reviewRating: { '@type': 'Rating', ratingValue: '5' },
              reviewBody:
                'The roof report was extremely accurate and saved us hours.',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Can I use the tools offline?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, our PWA works offline for field crews.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Do you offer certifications?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, we are GAF certified and OSHA compliant.',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        <SkipToContent />
        <ToastProvider>
          <CopilotProvider>
            {maintenanceMode ? (
              <div className="min-h-screen flex items-center justify-center" role="main">
                <p>Site is under maintenance. Please check back soon.</p>
              </div>
            ) : (
              <>
                {/* --- GLOBAL, PERSISTENT COMPONENTS --- */}
                <Starfield aria-hidden="true" />
                <Header />
                <main id="main-content" className="relative z-10 min-h-screen pt-20">
                  <PageTransitionWrapper>
                    <ClientLayout>
                      {children}
                    </ClientLayout>
                  </PageTransitionWrapper>
                </main>
                <StickyMobileCTA />
                <PWAInstallPrompt />
                <AccessibilityPanel />
                <PWARegistration />
                <Analytics />
                <VercelAnalytics />
              </>
            )}
          </CopilotProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
