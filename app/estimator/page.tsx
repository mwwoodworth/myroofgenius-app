import dynamicImport from 'next/dynamic'

const Estimator = dynamicImport(() => import('../../components/AIEstimator'), { ssr: false })

export const dynamic = 'force-dynamic'

export default function EstimatorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Estimator />
    </div>
  )
}
