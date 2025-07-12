"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useConfetti } from "../../hooks/use-confetti";
import UpgradeBanner from "../../components/marketing/UpgradeBanner";

export default function SuccessPage() {
  const triggerConfetti = useConfetti();
  useEffect(() => {
    triggerConfetti();
  }, [triggerConfetti]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="max-w-md w-full space-y-8 p-8 bg-bg-card rounded-lg shadow">
        <UpgradeBanner />
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-accent-emerald">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-text-primary">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Thank you for your purchase. You&apos;ll receive a confirmation
            email shortly.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-700 hover:bg-secondary-700/80"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/products"
            className="w-full flex justify-center py-2 px-4 border border-secondary/30 rounded-md shadow-sm text-sm font-medium text-text-secondary bg-bg-card hover:bg-bg"
          >
            Browse More Products
          </Link>
        </div>
      </div>
    </div>
  );
}
