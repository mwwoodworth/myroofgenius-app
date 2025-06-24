import React, { useEffect, useState } from 'react'

export interface RoofReport {
  roof_id: number
  summary: string
}

export default function RoofReportCard() {
  const [report, setReport] = useState<RoofReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/roof/report')
      .then((res) => res.json())
      .then((data) => {
        setReport(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-4 border rounded shadow">Loading...</div>
  }

  if (!report) {
    return <div className="p-4 border rounded shadow">Failed to load report</div>
  }

  return (
    <div className="p-4 bg-white border rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Roof Report</h2>
      <p className="text-gray-700">ID: {report.roof_id}</p>
      <p className="text-gray-700">{report.summary}</p>
    </div>
  )
}
