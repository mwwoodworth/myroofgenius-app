"use client";
import { useState } from "react";

interface Finding {
  id: string;
  text: string;
  confidence: number;
}

interface ProposalPreviewProps {
  findings: Finding[];
}

export default function ProposalPreview({ findings }: ProposalPreviewProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    findings.forEach((f) => (init[f.id] = true));
    return init;
  });

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const proposal = findings
    .filter((f) => selected[f.id])
    .map((f) => `- ${f.text}`)
    .join("\n");

  return (
    <div className="grid md:grid-cols-2 gap-6" aria-label="Proposal preview">
      <div className="space-y-2">
        {findings.map((f) => (
          <label key={f.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected[f.id]}
              onChange={() => toggle(f.id)}
            />
            {f.text}
          </label>
        ))}
      </div>
      <pre
        className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm"
        aria-label="Generated proposal"
      >
        {proposal}
      </pre>
    </div>
  );
}
