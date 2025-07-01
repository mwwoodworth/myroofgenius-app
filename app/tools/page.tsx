'use client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export const dynamic = 'force-dynamic';

export default function NoCodeTools() {
  const tools = [
    {
      title: 'Project Dashboards',
      description: 'Live job metrics powered by Claude no-code widgets.',
      url: 'https://claude.ai/dashboard'
    },
    {
      title: 'Smart Intake Forms',
      description: 'Drag-and-drop forms with AI validation and suggestions.',
      url: 'https://claude.ai/forms'
    },
    {
      title: 'Photo Annotation',
      description: 'Quickly tag field photos and auto-capture GPS data.',
      url: 'https://claude.ai/photos'
    },
    {
      title: 'Proposal Generator',
      description: 'Automate contracts and proposals in seconds.',
      url: 'https://claude.ai/proposals'
    },
    {
      title: 'Onboarding Bot',
      description: 'Guided help flows for new admins and field teams.',
      url: 'https://claude.ai/onboarding'
    }
  ];
  return (
    <main className="min-h-screen pt-32 bg-bg text-text-primary px-4">
      <h1 className="text-4xl font-bold text-center mb-8">AI Tools</h1>
      <p className="text-center text-text-secondary mb-12">
        Powered by Claude. Use these no-code widgets to streamline your work.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tools.map((tool) => (
          <Card key={tool.title} className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
              <p className="text-text-secondary mb-4">{tool.description}</p>
            </div>
            <Button onClick={() => window.open(tool.url, '_blank')}>Open Tool</Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
