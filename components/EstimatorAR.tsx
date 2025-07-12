'use client';
/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

export default function EstimatorAR() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="h-64 w-full bg-[var(--color-navy-900)] text-white rounded-xl mt-4"
    >
      <Canvas>
        <Suspense fallback={null}>
          {/* Placeholder plane representing roof model */}
          <mesh rotation={[-0.5, 0.2, 0]}>
            <planeGeometry args={[3, 3]} />
          {(() => {
            const c = typeof window !== 'undefined'
              ? getComputedStyle(document.documentElement)
                  .getPropertyValue('--color-warning')
                  .trim() || '#ecc94b'
              : '#ecc94b';
            return <meshStandardMaterial color={c} />;
            })()}{/* uses warning token */}
          </mesh>
          <ambientLight intensity={0.5} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}
