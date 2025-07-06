'use client';
import Card from './ui/Card';

export default function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card glass className="text-center space-y-2">
      <h4 className="text-xl font-semibold">{title}</h4>
      <p className="text-text-secondary">{desc}</p>
    </Card>
  );
}
