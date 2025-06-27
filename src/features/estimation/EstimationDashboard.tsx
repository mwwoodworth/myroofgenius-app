'use client';
import { useState, useEffect } from 'react';
import { RiskAnalysisEngine, ProjectData } from '../../utils/RiskAnalysisEngine';
import { supabase } from '../../services/supabaseClient';

const engine = new RiskAnalysisEngine();

export default function EstimationDashboard() {
  const [baseCost, setBaseCost] = useState(100000);
  const [risks, setRisks] = useState([] as ReturnType<typeof engine.analyzeProject>);
  const [loading, setLoading] = useState(false);

  async function loadProject() {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').limit(1).single();
    if (data) setBaseCost(data.base_cost || 100000);
    setLoading(false);
  }

  const runAnalysis = () => {
    const data: ProjectData = { baseCost, buildingAge: 25, previousLeaks: true };
    setRisks(engine.analyzeProject(data));
  };

  useEffect(() => {
    loadProject();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Estimation Dashboard</h1>
      {loading && <p className="mb-4">Loading project...</p>}
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Base Cost</label>
          <input
            type="number"
            className="border rounded p-2 text-black"
            value={baseCost}
            onChange={e => setBaseCost(parseFloat(e.target.value))}
          />
        </div>
        <button onClick={runAnalysis} className="px-4 py-2 bg-blue-600 text-white rounded">Run Analysis</button>
      </div>
      {risks.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-xl font-semibold">Identified Risks</h2>
          {risks.map(risk => (
            <div key={risk.type} className="border p-2 rounded bg-white/10 backdrop-blur-sm">
              <p className="font-medium">{risk.type}</p>
              <p>Probability: {(risk.probability * 100).toFixed(0)}%</p>
              <p>Impact: ${risk.impactLow.toFixed(0)} - ${risk.impactHigh.toFixed(0)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
