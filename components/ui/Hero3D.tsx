'use client';
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function SpinningShape() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.rotation.x += 0.005;
    }
  });
  const color =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary')
          .trim() || '#4299e1'
      : '#4299e1';
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} /> {/* uses primary token */}
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="h-64 w-full bg-[var(--color-navy-900)]/60 rounded-xl ring-2 ring-accent/80 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
    >
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} />
        <SpinningShape />
      </Canvas>
    </motion.div>
  );
}
