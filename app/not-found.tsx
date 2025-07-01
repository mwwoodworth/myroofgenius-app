'use client';
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text-primary">
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-text-secondary mb-6">You’ve reached an invalid page, but your estimate is still just one click away.</p>
      <a href="/" className="btn-accent px-6 py-2 rounded-xl font-bold">Return Home</a>
    </div>
  );
}
