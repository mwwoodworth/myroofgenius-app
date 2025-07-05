'use client';
/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';

export default function Dashboard3D() {
  return (
    <div className="h-64 w-full bg-gray-900 text-white rounded-xl">
      <Canvas camera={{ position: [3, 3, 3] }}>
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {/* base */}
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[2, 1, 2]} />
              {/* @ts-expect-error three types */}
              <meshStandardMaterial color="#6b7280" />
            </mesh>
            {/* roof */}
            <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 1.2, 0]}>
              <coneGeometry args={[1.6, 1, 4]} />
              {/* @ts-expect-error three types */}
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
          </group>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
