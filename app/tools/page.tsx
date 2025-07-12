"use client";
import { useState } from "react";
import Head from "next/head";
import Uploader from "../../components/Uploader";
import ConfidenceScore from "../../components/ConfidenceScore";
import ProposalPreview from "../../components/ProposalPreview";
import ProgressBar from "../../components/ProgressBar";
import { buildMeta } from "../../lib/metadata";

export const generateMetadata = () =>
  buildMeta({
    title: "Roofing Calculators & AI Tools | MyRoofGenius",
    description:
      "Estimate costs, analyze damage and generate proposals using our professional roofing tools.",
  });

interface Finding {
  id: string;
  text: string;
  confidence: number;
}

export default function ToolsPage() {
  const [step, setStep] = useState<number>(0);
  const [results, setResults] = useState<Finding[] | null>(null);

  const handleComplete = () => {
    runAnalysis();
  };

  const runAnalysis = () => {
    const steps = [1, 2, 3];
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setStep(idx);
      if (idx === steps.length) {
        clearInterval(interval);
        const fake: Finding[] = [
          { id: "f1", text: "Replace damaged shingles", confidence: 0.9 },
          { id: "f2", text: "Seal flashing around chimney", confidence: 0.8 },
          { id: "f3", text: "Install new gutter guards", confidence: 0.75 },
        ];
        setResults(fake);
      }
    }, 1200);
  };

  const overall =
    results &&
    results.reduce((sum, f) => sum + f.confidence, 0) / results.length;

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: "Roof Analysis Tools",
              provider: { "@type": "Organization", name: "MyRoofGenius" },
            }),
          }}
        />
      </Head>
      <main className="min-h-screen pt-32 px-4 max-w-4xl mx-auto bg-bg">
        {!results ? (
          <div>
            <h1 className="text-3xl font-bold mb-6 text-center">AI Tool</h1>
            <Uploader onComplete={handleComplete} />
            {step > 0 && (
              <div className="mt-8 space-y-4" aria-live="polite">
                <div>
                  <p className="font-medium mb-1">Step 1: Geometry</p>
                  <ProgressBar value={step >= 1 ? 100 : 0} />
                </div>
                <div>
                  <p className="font-medium mb-1">Step 2: Damage Detection</p>
                  <ProgressBar value={step >= 2 ? 100 : 0} />
                </div>
                <div>
                  <p className="font-medium mb-1">Step 3: Report Gen</p>
                  <ProgressBar value={step >= 3 ? 100 : 0} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center mb-4">
              Analysis Results
            </h1>
            {overall && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Overall Confidence
                </h2>
                <ProgressBar value={Math.round(overall * 100)} />
              </div>
            )}
            {results.map((f) => (
              <ConfidenceScore key={f.id} label={f.text} score={f.confidence} />
            ))}
            <ProposalPreview findings={results} />
          </div>
        )}
      </main>
    </>
  );
}
