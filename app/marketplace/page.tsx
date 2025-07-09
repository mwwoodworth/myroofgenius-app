import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import MarketplaceClient from "../../components/marketplace/MarketplaceClient";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return <MarketplaceClient initialProducts={data || []} />;
}
