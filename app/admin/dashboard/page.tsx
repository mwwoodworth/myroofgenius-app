import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { buildMeta } from "../../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Admin Dashboard | MyRoofGenius",
    description: "Internal admin dashboard for managing the platform.",
  });

export default async function AdminDashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user ||
    (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)
  ) {
    redirect("/");
  }

  const { default: AdminDashboard } = await import("../../../components/AdminDashboard");
  return <AdminDashboard />;
}
