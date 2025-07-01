'use client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export const dynamic = 'force-dynamic';

export default function FieldApps() {
  const apps = [
    {
      title: 'Smart Field Inspection',
      description: 'Capture photos, annotate issues, and auto-log GPS/metadata.',
      url: 'https://claude.ai/inspection'
    },
    {
      title: 'On-Site Proposal Generator',
      description: 'Instantly draft proposals and estimates from your phone.',
      url: 'https://claude.ai/proposal'
    },
    {
      title: 'Real-Time Punchlist Dashboard',
      description: 'Track project tasks collaboratively with AI suggestions.',
      url: 'https://claude.ai/punchlist'
    }
  ];
  return (
    <main className="min-h-screen pt-32 bg-bg text-text-primary px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Field Apps</h1>
      <p className="text-center text-text-secondary mb-12">
        Quick links to Claude-powered utilities for crews and partners.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {apps.map((app) => (
          <Card key={app.title} className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{app.title}</h3>
              <p className="text-text-secondary mb-4">{app.description}</p>
            </div>
            <Button onClick={() => window.open(app.url, '_blank')}>Open App</Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
