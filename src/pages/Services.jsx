import React from 'react';
import { motion } from 'framer-motion';

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
    <motion.div
      className="max-w-5xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">System Capabilities</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            className="bg-white shadow rounded p-6 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <span className="text-xs uppercase text-[#2366d1] font-semibold mb-2">{s.role}</span>
            <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
            <p className="text-sm flex-grow">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
