"use client";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function Starfield() {
  return (
    <Canvas className="fixed inset-0 -z-10" camera={{ position: [0, 0, 1] }}>
      {/* Reduced star count to smooth out header artifacts */}
      <Stars
        radius={50}
        depth={50}
        count={1500}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </Canvas>
  );
}
