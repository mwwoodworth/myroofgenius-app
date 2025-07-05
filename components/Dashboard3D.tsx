'use client';
/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

export default function Dashboard3D() {
  return (
    <div className="h-64 w-full bg-gray-900 text-white rounded-xl">
      <Canvas>
        <Suspense fallback={null}>
          {/* Placeholder 3D scene */}
          <mesh rotation={[0.4, 0.2, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            {/* @ts-expect-error three types */}
            <meshStandardMaterial color="#5E5CE6" />
          </mesh>
          <ambientLight intensity={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
