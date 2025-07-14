import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Roofing Templates Marketplace | MyRoofGenius",
    description:
      "Shop digital calculators, checklists and premium templates built for roofing contractors.",
  });

export default async function MarketplacePage() {
  const { default: MarketplaceClient } = await import("../../components/marketplace/MarketplaceClient");
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MyRoofGenius",
            url: "https://myroofgenius.com",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Digital Roofing Tools Marketplace",
            description: "Professional roofing calculators and templates",
            brand: "MyRoofGenius",
          }),
        }}
      />
      <MarketplaceClient initialProducts={data || []} />
    </>
  );
}
