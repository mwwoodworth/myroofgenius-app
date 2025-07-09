import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import MarketplaceClient from "../../components/marketplace/MarketplaceClient";
import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Marketplace | MyRoofGenius",
    description: "Browse and purchase roofing calculators and templates."
  });

export default async function MarketplacePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return <MarketplaceClient initialProducts={data || []} />;
}
