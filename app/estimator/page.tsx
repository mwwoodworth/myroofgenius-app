import { estimatorEnabled } from "../lib/features";
import { buildMeta } from "../../lib/metadata";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildMeta({
    title: "Estimator | MyRoofGenius",
    description: "Estimate roofing materials with AI assistance.",
  });

export default async function EstimatorPage() {
  const { PagePrompt } = await import("../../components/ui");
  const Estimator = (await import("../../components/SimpleEstimator")).default;
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
