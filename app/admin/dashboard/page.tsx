import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import AdminDashboard from "../../../components/AdminDashboard";

export const dynamic = "force-dynamic";

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

  return <AdminDashboard />;
}
