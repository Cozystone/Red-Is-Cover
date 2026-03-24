'use client'

// GunCanvas — Three.js gun model (dynamically imported, no SSR)
// Rendered inside a full-screen fixed overlay managed by GunOverlay.tsx

import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { GunState } from '@/lib/gunContext'

// ── Preload model as soon as JS bundle loads ─────────────────────────────────
useGLTF.preload('/gun.glb')

// ── Auto-scale helper ────────────────────────────────────────────────────────

function fitToSize(obj: THREE.Object3D, targetUnits: number) {
  const box  = new THREE.Box3().setFromObject(obj)
  const size = box.getSize(new THREE.Vector3())
  const max  = Math.max(size.x, size.y, size.z)
  return max > 0 ? targetUnits / max : 1
}

// ── Gun mesh ─────────────────────────────────────────────────────────────────

function GunMesh({ gunState }: { gunState: GunState }) {
  const { scene }  = useGLTF('/gun.glb')
  const groupRef   = useRef<THREE.Group>(null)
  const { viewport, size } = useThree()

  // Shared refs — avoid re-renders
  const mouse   = useRef({ x: 0, y: 0 })      // NDC [-1..1]
  const dropY   = useRef(20)
  const phase   = useRef(Math.random() * Math.PI * 2)
  const scaled  = useRef(false)
  const clone   = useRef(scene.clone(true))

  // Track mouse in NDC space
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouse.current.x =  (e.clientX / size.width)  * 2 - 1
      mouse.current.y = -(e.clientY / size.height) * 2 + 1
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [size])

  // Reset drop animation when transitioning to dropping
  useEffect(() => {
    if (gunState === 'dropping') dropY.current = 20
  }, [gunState])

  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return

    // One-time scale fit
    if (!scaled.current) {
      const s = fitToSize(clone.current, 1.8)
      g.scale.setScalar(s)
      scaled.current = true
    }

    if (gunState === 'dropping') {
      // Animate drop: gun enters from above, handle pointing down toward viewer
      const topEdge = viewport.height / 2 - 0.6   // handle hovers just inside top
      dropY.current += (topEdge - dropY.current) * 0.04

      phase.current += dt * 1.0
      const bob = Math.sin(phase.current) * 0.07

      g.position.x = 0
      g.position.y = dropY.current + bob
      g.position.z = 0

      // Barrel points upward (rotate 180° on X so grip faces down)
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, Math.PI, dt * 3)
      // Slow spin on Y to show 3D depth
      g.rotation.y += dt * 0.45
      g.rotation.z = 0

    } else if (gunState === 'aiming') {
      // Smoothly follow cursor in world space
      const wx = mouse.current.x * (viewport.width  / 2)
      const wy = mouse.current.y * (viewport.height / 2)
      g.position.x += (wx - g.position.x) * 0.14
      g.position.y += (wy - g.position.y) * 0.14
      g.position.z = 0

      // Horizontal aim: barrel points forward-right
      // rotation.x = 0 (level), rotation.y = PI/2 (side view showing barrel length)
      // rotation.z = slight lean based on cursor X
      const lean = mouse.current.x * 0.15
      g.rotation.x += (0                  - g.rotation.x) * 0.12
      g.rotation.y += ((Math.PI / 2)      - g.rotation.y) * 0.12
      g.rotation.z += (lean               - g.rotation.z) * 0.10
    }
  })

  // Only render during interactive states
  if (gunState !== 'dropping' && gunState !== 'aiming') return null

  return (
    <group ref={groupRef}>
      <primitive object={clone.current} />
    </group>
  )
}

// ── Canvas wrapper ───────────────────────────────────────────────────────────

export default function GunCanvas({ gunState }: { gunState: GunState }) {
  return (
    <Canvas
      gl={{
        alpha:            true,
        antialias:        true,
        powerPreference:  'high-performance',
        toneMapping:      THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
      }}
      camera={{ position: [0, 0, 10], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      {/* Key lights for metallic gun */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 10, 6]}   intensity={3.0} color="#ffffff" />
      <directionalLight position={[-4, -3, -4]}  intensity={0.5} color="#88aaff" />
      <pointLight       position={[0,  3,  4]}   intensity={1.2} color="#ff3300" />
      <pointLight       position={[0, -2,  3]}   intensity={0.6} color="#ffffff" />

      <GunMesh gunState={gunState} />
    </Canvas>
  )
}
