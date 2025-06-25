'use client'
export default function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-bg-card p-6 rounded-xl shadow-md text-center min-h-[44px]">
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-text-secondary">{desc}</p>
    </div>
  )
}
