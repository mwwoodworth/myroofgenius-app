import dynamicImport from "next/dynamic";
import { estimatorEnabled } from "../lib/features";
import { PagePrompt } from "../../components/ui";
import { buildMeta } from "../../lib/metadata";

const Estimator = dynamicImport(
  () => import("../../components/SimpleEstimator"),
  { ssr: false },
);

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Estimator | MyRoofGenius",
    description: "Estimate roofing materials with AI assistance.",
  });

export default function EstimatorPage() {
  if (!estimatorEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p>Estimator feature is disabled.</p>
      </div>
    );
  }
  return (
    <>
      <PagePrompt prompt="Estimate roofing materials" />
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-4">
        <Estimator />
      </div>
    </>
  );
}
