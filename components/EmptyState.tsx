'use client';
import Lottie from 'lottie-react';
import type { ReactNode } from 'react';
import animationData from '../public/empty-box.json';

export default function EmptyState({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="mx-auto w-40 h-40">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <p className="text-gray-600">{message}</p>
      {children}
    </div>
  );
}
