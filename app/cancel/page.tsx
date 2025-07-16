export const dynamic = "force-dynamic";
import { constructMetadata } from "../lib/metadata";

export const metadata = constructMetadata({
  title: "Payment Cancelled | MyRoofGenius - Return to Marketplace",
  description: "Your payment was cancelled. You can return to the MyRoofGenius marketplace to explore AI-powered roofing tools and software anytime.",
  keywords: ['payment cancelled', 'myroofgenius cancel', 'return marketplace', 'roofing software', 'cancelled order'],
});

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
