'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

function SpinningBox() {
  const ref = useRef<Mesh>(null!)
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01
      ref.current.rotation.y += 0.01
    }
  })
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

export const RoofDemo = () => {
  return (
    <Canvas style={{ height: 300 }} data-testid="roof-demo">
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <SpinningBox />
    </Canvas>
  )
}
