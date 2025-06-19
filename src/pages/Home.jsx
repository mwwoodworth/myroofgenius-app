import React from 'react';

export default function Home() {
  return (
    <div>
      <section className="bg-[#202940] text-white py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Intelligent Systems for Commercial Roofing Professionals</h1>
        <p className="max-w-3xl mx-auto text-lg md:text-2xl">AI-powered tools that protect your decisions, prevent costly mistakes, and work under pressure without cutting corners</p>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <p>MyRoofGenius builds protective intelligence systems for commercial roofing professionals who can&apos;t afford to get it wrong. Our AI-native platform combines decades of field experience with real-time analysis to give you clarity and confidence.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded p-6 bg-white">
            <h3 className="font-semibold mb-2">Property Owners & Facility Managers</h3>
            <p className="text-sm mb-4">Decision-support tools and risk assessment frameworks that prevent costly surprises.</p>
          </div>
          <div className="border rounded p-6 bg-white">
            <h3 className="font-semibold mb-2">Roofing Contractors & Estimators</h3>
            <p className="text-sm mb-4">AI-powered estimation and project tracking to secure profitability on every job.</p>
          </div>
          <div className="border rounded p-6 bg-white">
            <h3 className="font-semibold mb-2">Architects & Specifiers</h3>
            <p className="text-sm mb-4">Validated assembly databases and compliance verification for fast-track projects.</p>
          </div>
          <div className="border rounded p-6 bg-white">
            <h3 className="font-semibold mb-2">Engineers & Technical Professionals</h3>
            <p className="text-sm mb-4">Comprehensive analysis tools and documentation frameworks for critical decisions.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
