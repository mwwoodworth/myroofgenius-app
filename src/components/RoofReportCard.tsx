import { useEffect, useState } from 'react';

interface RoofReport {
  report?: string;
}

export default function RoofReportCard() {
  const [data, setData] = useState<RoofReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/roof/report');
      const json = await resp.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    const id = setInterval(fetchReport, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {loading && <div>Refreshing...</div>}
      <pre data-testid="report">{JSON.stringify(data)}</pre>
    </div>
  );
}
