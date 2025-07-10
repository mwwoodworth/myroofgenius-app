'use client';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center text-center py-20 space-y-6">
      <h1 className="text-5xl font-bold font-display">Precision Roofing Intelligence</h1>
      <p className="max-w-2xl text-lg font-sans">
        AI-powered tools that deliver accuracy and efficiency for every project.
      </p>
      <button
        type="button"
        className="px-8 py-4 bg-neonGreen text-charcoalBlack rounded-md font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neonGreen"
      >
        Get Started
      </button>
      <div className="mt-10 w-full flex justify-center">
        <Image
          src="https://placehold.co/1200x600/121212/F0F0F0/png?text=AI+Roof+Analysis"
          alt="AI-generated analysis of a residential roof"
          width={1200}
          height={600}
          className="rounded"
        />
      </div>
    </section>
  );
}
