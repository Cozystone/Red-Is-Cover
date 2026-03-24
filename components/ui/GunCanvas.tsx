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
  gunState:      GunState
  navButtonPos:  { x: number; y: number }   // normalised 0-1
  updateAimPos:  (nx: number, ny: number) => void
}

function GunMesh({ gunState, navButtonPos, updateAimPos }: GunMeshProps) {
  const { scene }           = useGLTF('/gun.glb')
  const groupRef            = useRef<THREE.Group>(null)
  const { viewport, size }  = useThree()

  const mouse        = useRef({ x: 0, y: 0 })   // NDC [-1..1]
  const phase        = useRef(Math.random() * Math.PI * 2)
  const baseScale    = useRef(0)                 // computed once from the model
  const clone        = useRef(scene.clone(true))
  const dropReady    = useRef(false)             // whether drop start pos was set

  // Track mouse in NDC space
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mouse.current.x =  (e.clientX / size.width)  * 2 - 1
      mouse.current.y = -(e.clientY / size.height) * 2 + 1
    }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [size])

  // Reset drop flag when entering dropping state
  useEffect(() => {
    if (gunState === 'dropping') dropReady.current = false
  }, [gunState])

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
      // ── Scale: X flipped for mirror effect ───────────────────────────
      g.scale.set(-base * 1.6, base * 1.6, base * 1.6)

      // ── First frame: snap to start position far above viewport ───────
      if (!dropReady.current) {
        g.position.set(navWx, viewport.height, 0)
        g.rotation.set(-Math.PI / 2, 0, Math.PI / 2)
        dropReady.current = true
      }

      // ── Drop straight down — x locked, y eases to upper-screen rest ──
      const targetY = viewport.height * 0.42
      g.position.x  = navWx
      g.position.y += (targetY - g.position.y) * 0.07
      g.position.z  = 0

      // ── Side view, barrel up, left face toward camera ─────────────────
      g.rotation.set(-Math.PI / 2, 0, Math.PI / 2)

    } else if (gunState === 'aiming') {
      // ── Scale: medium — gun follows cursor ────────────────────────────
      g.scale.setScalar(base * 2.8)

      // ── Position: cursor tracking (gun is "held" by cursor) ───────────
      const wx = mouse.current.x * (viewport.width  / 2)
      const wy = mouse.current.y * (viewport.height / 2)
      g.position.x += (wx - g.position.x) * 0.13
      g.position.y += (wy - g.position.y) * 0.13
      g.position.z  = 0

      // Subtle idle wobble on top of cursor tracking
      phase.current += dt * 1.1
      g.position.x  += Math.sin(phase.current * 0.7) * 0.02
      g.position.y  += Math.sin(phase.current)       * 0.015

      // ── Rear view: hammer visible, slight lean from cursor ────────────
      const lean = mouse.current.x * 0.08
      g.rotation.x += (0      - g.rotation.x) * 0.10
      g.rotation.y += (Math.PI - g.rotation.y) * 0.10
      g.rotation.z += (lean   - g.rotation.z) * 0.08

      // ── Report gun screen position for bullet impact tracking ─────────
      const nx = (g.position.x / (viewport.width  / 2) + 1) * 0.5
      const ny = (1 - g.position.y / (viewport.height / 2)) * 0.5
      updateAimPos(nx, ny)
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
  gunState:      GunState
  navButtonPos:  { x: number; y: number }
  updateAimPos:  (nx: number, ny: number) => void
}

export default function GunCanvas({ gunState, navButtonPos, updateAimPos }: GunCanvasProps) {
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

      <GunMesh gunState={gunState} navButtonPos={navButtonPos} updateAimPos={updateAimPos} />
    </Canvas>
  )
}
