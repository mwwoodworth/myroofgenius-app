import React, { useState, useEffect } from 'react';

interface RoofReport {
  report: string;
}

export default function RoofReportCard() {
  const [report, setReport] = useState<RoofReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      const resp = await fetch('/api/roof/report');
      setReport(await resp.json());
    } catch (err) {
      console.error('Failed fetching report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    const id = setInterval(loadReport, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="border p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Roof Report</h3>
      {report ? (
        <pre data-testid="report">{JSON.stringify(report)}</pre>
      ) : (
        <div>No report</div>
      )}
    </div>
  );
}
