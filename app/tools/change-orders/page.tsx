"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import ToolDemoModal from "../../../components/marketing/ToolDemoModal";
import { PagePrompt } from "../../../components/ui";

export default function ChangeOrders() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <>
      <PagePrompt prompt="How to manage change orders" />
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
      <div className="max-w-2xl bg-cloud-100 dark:bg-slate-700 rounded-xl shadow-lg p-8 text-center">
        <Image
          src="https://images.unsplash.com/photo-1581092613290-7e876675c352?w=800&h=450&fit=crop"
          alt="Change order calculator screenshot"
          width={800}
          height={450}
          className="rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">Change Order Calculator</h1>
        <p className="text-gray-600 mb-6">
          Price project changes fairly while protecting your margins.
        </p>
        <div className="space-y-2 mb-6 text-left">
          <p>✓ Automatic markup scaling</p>
          <p>✓ Cumulative impact tracking</p>
          <p>✓ Client-ready reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowDemo(true)}
            className="px-6 py-3 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 text-gray-800"
          >
            Try Demo
          </button>
          <Link
            href="/signup"
            className="px-6 py-3 bg-secondary-700 text-white rounded-lg font-semibold hover:bg-secondary-700/80"
          >
            Create Free Account
          </Link>
        </div>
        <ToolDemoModal
          open={showDemo}
          onClose={() => setShowDemo(false)}
          title="Change Order Calculator"
        />
      </div>
    </div>
    </>
  );
}
