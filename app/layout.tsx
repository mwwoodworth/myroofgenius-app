import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import dynamicImport from "next/dynamic";
import "./lib/sentry";
import { maintenanceMode } from "./lib/features";
import { Analytics } from "../components/ui";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

const ClientLayout = dynamicImport(
  () => import("../components/layout/ClientLayout"),
  { ssr: false },
);

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const theme = `${inter.variable} ${jetbrains.variable}`;

export const metadata = {
  title: "MyRoofGenius - Smart Roofing Solutions",
  description: "AI-powered roofing tools and marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={theme}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0a192f" /> {/* navy-900 token */}
        <link
          rel="icon"
          href="https://via.placeholder.com/192"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="https://via.placeholder.com/512"
          sizes="512x512"
        />
        <link
          rel="icon"
          href="https://via.placeholder.com/1024"
          sizes="1024x1024"
        />
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
        {maintenanceMode ? (
          <div className="min-h-screen flex items-center justify-center">
            <p>Site is under maintenance. Please check back soon.</p>
          </div>
        ) : (
          <>
            <ClientLayout>{children}</ClientLayout>
            <Analytics />
            <VercelAnalytics />
          </>
        )}
      </body>
    </html>
  );
}
