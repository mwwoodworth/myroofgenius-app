import { createClient } from '@supabase/supabase-js';
import EmptyState from '@/components/EmptyState';

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic';

async function getOrders() {
  // Handle missing env vars gracefully
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }

  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // For now, return empty array - add auth later
  return [];
}

export default async function Account() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="bg-bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          {orders.length === 0 ? (
            <EmptyState message="No orders yet." />
          ) : (
            <div className="space-y-4">
              {/* Order list would go here */}
            </div>
          )}
        </div>

        <div className="mt-6 bg-bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <p className="text-text-secondary">
            Update your email or password from the profile menu. Contact support
            if you need any help managing your subscription.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/marketplace"
            className="text-secondary-700 hover:underline font-semibold"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );}