import React from 'react';

const services = [
  {
    title: 'Estimation Intelligence System',
    role: 'Estimators',
    desc: 'Analyzes specs against thousands of installations and validates quantities to protect your margins.'
  },
  {
    title: 'Project Control System',
    role: 'Project Managers',
    desc: 'Monitors milestones and provides early warnings for schedule or budget risk.'
  },
  {
    title: 'Specification Verification System',
    role: 'Architects',
    desc: 'Cross-checks material selections and code compliance to eliminate RFIs and delays.'
  }
];

export default function Services() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">System Capabilities</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s.title} className="bg-white shadow rounded p-6 flex flex-col">
            <span className="text-xs uppercase text-[#2366d1] font-semibold mb-2">{s.role}</span>
            <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
            <p className="text-sm flex-grow">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
