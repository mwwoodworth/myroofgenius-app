import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Demo | MyRoofGenius",
    description:
      "Watch demos of our estimation and compliance tools in action.",
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
