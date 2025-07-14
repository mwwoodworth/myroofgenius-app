import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Admin | MyRoofGenius",
    description: "Administrative dashboard for managing site content.",
  });

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();
  if (!profile?.is_admin) {
    redirect("/dashboard");
  }
  const { default: AdminDashboard } = await import("../../components/AdminDashboard");
  return <AdminDashboard />;
}
