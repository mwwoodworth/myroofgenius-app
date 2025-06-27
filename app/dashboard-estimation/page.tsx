import dynamicImport from 'next/dynamic';

const EstimationDashboard = dynamicImport(() => import('../../src/features/estimation/EstimationDashboard'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function EstimationDashboardPage() {
  return <EstimationDashboard />;
}
