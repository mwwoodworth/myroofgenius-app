'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

export default function EstimatorAR() {
  return (
    <div className="h-64 w-full bg-gray-900 text-white rounded-xl mt-4">
      <Canvas>
        <Suspense fallback={null}>
          {/* Placeholder plane representing roof model */}
          <mesh rotation={[-0.5, 0.2, 0]}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial color="orange" />
          </mesh>
          <ambientLight intensity={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
