'use client';
export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { sendAlert } from './lib/notify';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    sendAlert(`Next.js error: ${error.message}`);
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={() => reset()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
