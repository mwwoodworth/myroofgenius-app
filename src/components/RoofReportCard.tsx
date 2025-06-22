import { useEffect, useState } from 'react'

interface RoofReport {
  status: string
  lastInspection: string
  damageScore: number
}

export default function RoofReportCard() {
  const [data, setData] = useState<RoofReport | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/roof/report')
      const json = await resp.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
    const id = setInterval(fetchReport, 30000)
    return () => clearInterval(id)
  }, [])

  if (loading && !data) {
    return (
      <div className="p-4 border rounded shadow flex items-center space-x-2" data-testid="loading">
        <div className="h-5 w-5 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded shadow max-w-sm bg-white">
      {loading && (
        <div className="text-xs text-gray-500 mb-2" data-testid="refresh">
          Refreshing...
        </div>
      )}
      <dl data-testid="report" className="space-y-1">
        <div className="flex justify-between">
          <dt className="font-medium">Status</dt>
          <dd>{data?.status}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-medium">Last Inspection</dt>
          <dd>{data ? new Date(data.lastInspection).toLocaleDateString() : ''}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-medium">Damage Score</dt>
          <dd>{data?.damageScore}</dd>
        </div>
      </dl>
    </div>
  )
}
