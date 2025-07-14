

import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Estimation Dashboard | MyRoofGenius",
    description: "Interactive dashboard for tracking job estimates.",
  });

export default async function EstimationDashboardPage() {
  const EstimationDashboard = (
    await import("../../src/features/estimation/EstimationDashboard")
  ).default;
  return <EstimationDashboard />;
}
