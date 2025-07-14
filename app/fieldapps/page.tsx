import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Field Apps for Roofing Crews | MyRoofGenius",
    description:
      "Offline-ready mobile apps for inspections, proposals and project punchlists.",
  });

export default async function FieldApps() {
  const { default: FieldAppsClient } = await import("./FieldAppsClient");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://myroofgenius.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Field Apps",
                item: "https://myroofgenius.com/fieldapps",
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Field Applications",
            provider: { "@type": "Organization", name: "MyRoofGenius" },
          }),
        }}
      />
      <FieldAppsClient />
    </>
  );
}
