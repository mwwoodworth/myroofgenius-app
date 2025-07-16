import { constructMetadata } from "../lib/metadata";

export const metadata = constructMetadata({
  title: "Demo | MyRoofGenius - See AI-Powered Roofing Software in Action",
  description: "Watch live demos of MyRoofGenius AI roofing software. See how our estimation tools, compliance features, and project management streamline your roofing business.",
  keywords: ['roofing software demo', 'AI roofing demo', 'contractor tools demonstration', 'roofing estimator demo', 'construction software trial'],
});

export default async function DemoPage() {
  const { default: DemoClient } = await import("./DemoClient");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What do the demos cover?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Each demo shows how our AI tools streamline estimating and compliance tasks.",
                },
              },
              {
                "@type": "Question",
                name: "Are the features available today?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, all features in the demos are available to all subscribers.",
                },
              },
            ],
          }),
        }}
      />
      <DemoClient />
    </>
  );
}
