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

interface GunMeshProps {
  gunState:     GunState
  navButtonPos: { x: number; y: number }   // normalised 0-1
}

function GunMesh({ gunState, navButtonPos }: GunMeshProps) {
  const { scene }           = useGLTF('/gun.glb')
  const groupRef            = useRef<THREE.Group>(null)
  const { viewport, size }  = useThree()

  const mouse      = useRef({ x: 0, y: 0 })   // NDC [-1..1]
  const phase      = useRef(Math.random() * Math.PI * 2)
  const baseScale  = useRef(0)                 // computed once from the model
  const clone      = useRef(scene.clone(true))

  // Track mouse in NDC space
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouse.current.x =  (e.clientX / size.width)  * 2 - 1
      mouse.current.y = -(e.clientY / size.height) * 2 + 1
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [size])

  // When entering 'dropping', push the gun above the viewport so it slides in
  useEffect(() => {
    if (gunState === 'dropping' && groupRef.current) {
      groupRef.current.position.set(0, viewport.height, 0)
    }
  }, [gunState, viewport.height])

  useFrame((_, dt) => {
    const g = groupRef.current
    if (!g) return

    // Compute base scale once (normalised to 1 world unit)
    if (baseScale.current === 0) {
      baseScale.current = fitToSize(clone.current, 1.0)
    }
    const base = baseScale.current

    // ── Nav-button world position ─────────────────────────────────────────
    const navWx = (navButtonPos.x * 2 - 1)       * (viewport.width  / 2)
    const navWy = (1 - navButtonPos.y * 2)        * (viewport.height / 2)

    if (gunState === 'dropping') {
      // ── Scale: small — only the handle region is visible ─────────────
      g.scale.setScalar(base * 1.6)

      // ── Position: handle at nav button, barrel off-screen above ──────
      // rotation.x = PI → grip is at the bottom of the gun in world space
      // gun center sits ~0.6 units above grip → offset navWy upward
      const targetX = navWx
      const targetY = navWy + 0.6
      g.position.x += (targetX - g.position.x) * 0.10
      g.position.y += (targetY - g.position.y) * 0.10
      g.position.z  = 0

      // Gentle handle bob
      phase.current += dt * 0.9
      g.position.y  += Math.sin(phase.current) * 0.03

      // Barrel points straight up, grip faces down (toward viewer)
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, Math.PI, dt * 6)
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, 0,        dt * 6)
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, 0,        dt * 6)

    } else if (gunState === 'aiming') {
      // ── Scale: large — first-person FPS view ─────────────────────────
      g.scale.setScalar(base * 4.5)

      // ── Position: lower-right quadrant, fixed anchor point ───────────
      const fpX = viewport.width  *  0.18
      const fpY = viewport.height * -0.30
      g.position.x += (fpX - g.position.x) * 0.09
      g.position.y += (fpY - g.position.y) * 0.09
      g.position.z  = 0

      // Subtle idle hand-wobble
      phase.current += dt * 1.1
      g.position.x  += Math.sin(phase.current * 0.7) * 0.04
      g.position.y  += Math.sin(phase.current)       * 0.025

      // ── Rotation: diagonal view so barrel length is visible, cursor-driven aim
      const aimX = mouse.current.x * 0.20   // horizontal aim lean
      const aimY = mouse.current.y * 0.18   // vertical aim tilt

      g.rotation.x += ((-0.15 + aimY) - g.rotation.x) * 0.10
      // PI * 0.45 ≈ 81° → diagonal between side-view and front-view
      g.rotation.y += ((Math.PI * 0.45 + aimX * 0.5) - g.rotation.y) * 0.10
      g.rotation.z += ((-aimX * 0.10)                - g.rotation.z) * 0.08
    }
  })

  if (gunState !== 'dropping' && gunState !== 'aiming') return null

  return (
    <group ref={groupRef}>
      <primitive object={clone.current} />
    </group>
  )
}

// ── Canvas wrapper ───────────────────────────────────────────────────────────

interface GunCanvasProps {
  gunState:     GunState
  navButtonPos: { x: number; y: number }
}

export default function GunCanvas({ gunState, navButtonPos }: GunCanvasProps) {
  return (
    <Canvas
      gl={{
        alpha:               true,
        antialias:           true,
        powerPreference:     'high-performance',
        toneMapping:         THREE.ACESFilmicToneMapping,
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

      <GunMesh gunState={gunState} navButtonPos={navButtonPos} />
    </Canvas>
  )
}
