'use client';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8" role="status">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-700 mb-3"></div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}
