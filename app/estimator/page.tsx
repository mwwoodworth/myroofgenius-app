import dynamicImport from "next/dynamic";
import { estimatorEnabled } from "../lib/features";
import CopilotQuickButton from "../../components/CopilotQuickButton";

const Estimator = dynamicImport(
  () => import("../../components/SimpleEstimator"),
  { ssr: false },
);

export const dynamic = "force-dynamic";

export default function EstimatorPage() {
  if (!estimatorEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p>Estimator feature is disabled.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-4">
      <Estimator />
      <CopilotQuickButton prompt="Estimate roofing materials" />
    </div>
  );
}
