'use client'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function FieldAppsClient() {
  const apps = [
    {
      title: 'Smart Field Inspection',
      description: 'Capture photos, annotate issues, and auto-log GPS/metadata.',
      url: null
    },
    {
      title: 'On-Site Proposal Generator',
      description: 'Instantly draft proposals and estimates from your phone.',
      url: null
    },
    {
      title: 'Real-Time Punchlist Dashboard',
      description: 'Track project tasks collaboratively with AI suggestions.',
      url: null
    }
  ]
  return (
    <main className="min-h-screen pt-32 bg-bg text-text-primary px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Field Apps</h1>
      <p className="text-center text-text-secondary mb-12">
        Quick links to Claude-powered utilities for crews and partners.
      </p>
      <div className="card-grid max-w-6xl mx-auto">
        {apps.map((app) => (
          <Card key={app.title} className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{app.title}</h3>
              <p className="text-text-secondary mb-4">{app.description}</p>
            </div>
            {app.url ? (
              <Button onClick={() => window.open(app.url!, '_blank')}>Try Demo</Button>
            ) : (
              <Button disabled className="bg-gray-300 text-gray-600 cursor-not-allowed">Launching Q3 2025</Button>
            )}
          </Card>
        ))}
      </div>
    </main>
  )
}
