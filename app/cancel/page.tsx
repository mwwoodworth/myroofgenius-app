export const dynamic = 'force-dynamic';

export default function Cancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">Your payment was cancelled.</p>
        <a href="/marketplace" className="text-secondary-700 hover:underline">
          Back to Marketplace
        </a>
      </div>
    </div>
  );
}
