import FieldAppsClient from "./FieldAppsClient";
import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Field Apps | MyRoofGenius",
    description:
      "Quick links to Claude-powered utilities for crews and partners.",
  });

export default function FieldApps() {
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
      <FieldAppsClient />
    </>
  );
}
