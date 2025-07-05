'use client';
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function SpinningShape() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.x += 0.005;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 0]} />
      {/* @ts-expect-error three types */}
      <meshStandardMaterial color="#5E5CE6" />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <div className="h-64 w-full">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} />
        <SpinningShape />
      </Canvas>
    </div>
  );
}
