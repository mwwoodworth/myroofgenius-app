import ToolsClient from "./ToolsClient";
import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Roofing Tools | MyRoofGenius",
    description: "Professional calculators and financial tools for roofers.",
  });
export default function ToolsPage() {
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
                name: "Tools",
                item: "https://myroofgenius.com/tools",
              },
            ],
          }),
        }}
      />
      <ToolsClient />
    </>
  );
}
