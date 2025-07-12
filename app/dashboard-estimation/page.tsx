import dynamicImport from "next/dynamic";

const EstimationDashboard = dynamicImport(
  () => import("../../src/features/estimation/EstimationDashboard"),
  { ssr: false },
);

import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Estimation Dashboard | MyRoofGenius",
    description: "Interactive dashboard for tracking job estimates.",
  });

export default function EstimationDashboardPage() {
  return <EstimationDashboard />;
}
