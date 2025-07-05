'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  priceId: string
  productId: string
}

export default function CheckoutButton({ priceId, productId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const _router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_id: priceId,
          product_id: productId
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        setError('Checkout failed.');
      }
    } catch {
      setError('Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full"
      >
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="flex items-center justify-center text-xs text-gray-500 gap-1">
        <Lock className="w-4 h-4" /> Secure checkout powered by Stripe
      </p>
    </div>
  );
}
