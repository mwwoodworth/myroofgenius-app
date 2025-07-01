'use client';
import { useEffect } from 'react';
import { RecommendationContext } from '../../types/marketplace';

export default function AIRecommendationEngine({ context, onUpdate }: { context: RecommendationContext; onUpdate: (data: unknown) => void }) {
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/marketplace/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
      const data = await res.json();
      onUpdate(data);
    };
    fetchData();
  }, [context, onUpdate]);
  return null;
}
