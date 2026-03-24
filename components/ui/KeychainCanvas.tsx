'use client'

// KeychainCanvas — 3D keychain navigation rendered by @react-three/fiber
// Dynamically imported (no SSR) by KeychainNav.tsx

import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGun } from '@/lib/gunContext'

// ── Config ────────────────────────────────────────────────────────────────────
// Camera: position (0, 0.8, 9), FOV 55
// Visible Y at Z=0: 0.8 ± tan(27.5°)*9 ≈ 0.8 ± 4.69 → [-3.89, +5.49]
// ANCHOR_Y=4.5 (top of pendulum, barely in view → looks like hanging from above)
// Keychain center Y ≈ 2.9 → nicely centered
// Large ring at Y=23, R=18.5 → only bottom arc (Y≈4.5) peeks into view

const ANCHOR_Y  = 4.5
const RING_Y    = 23
const RING_R    = 18.5
const ARM       = 0.70   // pendulum arm length
const KW        = 1.30   // keychain width
const KH        = 1.75   // keychain height
const KD        = 0.10   // keychain depth
const SPREAD    = 7.0    // half-width spread (keychains from -7 to +7)

const NAV_ITEMS = [
  { label: 'WORLD',   color: '#D91C1C', textColor: '#ffffff', href: '#world'   },
  { label: 'WORK',    color: '#C9B55A', textColor: '#1a1a1a', href: '#work'    },
  { label: 'ARCHIVE', color: '#6e6e6e', textColor: '#ffffff', href: '#archive' },
  { label: 'ABOUT',   color: '#F5F0E8', textColor: '#060606', href: '#about'   },
  { label: 'CONTACT', color: '#B8CDD8', textColor: '#060606', href: '#contact' },
  { label: 'GUN',     color: '#D91C1C', textColor: '#ffffff', href: null       },
] as const

const N = NAV_ITEMS.length

// ── Text texture ──────────────────────────────────────────────────────────────

function makeText(label: string, textColor: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 128
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 256, 128)
  ctx.font      = 'bold 52px "Helvetica Neue", Helvetica, Arial, sans-serif'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = textColor
  ctx.fillText(label, 128, 64)
  return new THREE.CanvasTexture(c)
}

// ── Single keychain pendulum ──────────────────────────────────────────────────

interface PendulumProps {
  index:  number
  onNav:  (idx: number, clientX: number, clientY: number) => void
}

function Pendulum({ index, onNav }: PendulumProps) {
  const item    = NAV_ITEMS[index]
  const ref     = useRef<THREE.Group>(null)
  const angle   = useRef((Math.random() - 0.5) * 0.06)
  const angVel  = useRef(0)
  const prevMX  = useRef<number | null>(null)

  const x   = -SPREAD + (SPREAD * 2 * index) / (N - 1)
  const COM = ARM + KH / 2           // pivot-to-COM length
  const w2  = 9.81 / COM             // pendulum natural freq²

  const texture = useMemo(() => makeText(item.label, item.textColor), [item.label, item.textColor])

  useFrame((_, dt) => {
    const safe = Math.min(dt, 0.033)
    angVel.current += -w2 * angle.current * safe
    angVel.current *= Math.pow(0.93, safe * 60)
    angle.current  += angVel.current * safe
    angle.current   = Math.max(-0.55, Math.min(0.55, angle.current))
    if (ref.current) ref.current.rotation.z = angle.current
  })

  const onMove = useCallback((e: any) => {
    const mx = e.nativeEvent?.clientX ?? null
    if (mx !== null && prevMX.current !== null) {
      const vx = (mx - prevMX.current) / window.innerWidth * 2
      if (Math.abs(vx) > 0.001) angVel.current += vx * 7
    }
    prevMX.current = mx
  }, [])

  const onLeave = useCallback(() => { prevMX.current = null }, [])

  const onClick = useCallback((e: any) => {
    e.stopPropagation()
    onNav(index, e.nativeEvent?.clientX ?? window.innerWidth * 0.5, e.nativeEvent?.clientY ?? 24)
  }, [index, onNav])

  return (
    <group ref={ref} position={[x, ANCHOR_Y, 0]}>
      {/* Small connector ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.022, 8, 24]} />
        <meshStandardMaterial color="#c8c8d0" metalness={1} roughness={0.15} />
      </mesh>

      {/* Thin wire / arm */}
      <mesh position={[0, -(ARM * 0.5), 0]}>
        <cylinderGeometry args={[0.010, 0.010, ARM, 6]} />
        <meshStandardMaterial color="#a8a8b4" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Glass body */}
      <mesh
        position  ={[0, -(ARM + KH / 2), 0]}
        onPointerMove ={onMove}
        onPointerLeave={onLeave}
        onClick       ={onClick}
      >
        <boxGeometry args={[KW, KH, KD]} />
        <meshPhysicalMaterial
          color       ={item.color}
          metalness   ={0.02}
          roughness   ={0.06}
          transmission={0.78}
          thickness   ={0.5}
          ior         ={1.5}
          transparent
          side        ={THREE.DoubleSide}
        />
      </mesh>

      {/* Text — front */}
      <mesh position={[0, -(ARM + KH / 2), KD / 2 + 0.005]}>
        <planeGeometry args={[KW * 1.05, KH * 0.52]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>

      {/* Text — back */}
      <mesh position={[0, -(ARM + KH / 2), -(KD / 2 + 0.005)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[KW * 1.05, KH * 0.52]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Decorative main ring (partially visible at top) ───────────────────────────

function DecoRing() {
  return (
    <mesh position={[0, RING_Y, 0]} rotation={[0.15, 0, 0]}>
      <torusGeometry args={[RING_R, 0.08, 16, 160]} />
      <meshStandardMaterial color="#c8c8d2" metalness={1} roughness={0.12} />
    </mesh>
  )
}

// ── Scene (inside Canvas) ─────────────────────────────────────────────────────

function Scene() {
  const { activate } = useGun()

  const handleNav = useCallback((idx: number, clientX: number, clientY: number) => {
    const item = NAV_ITEMS[idx]
    if (item.label === 'GUN') {
      activate(clientX, clientY)
    } else if (item.href) {
      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activate])

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 8, 10]} intensity={3.5} />
      <directionalLight position={[-6, -3, 5]}  intensity={1.0} color="#aaddff" />

      <DecoRing />

      {NAV_ITEMS.map((_, i) => (
        <Pendulum key={i} index={i} onNav={handleNav} />
      ))}
    </>
  )
}

// ── Canvas wrapper (exported) ─────────────────────────────────────────────────

export default function KeychainCanvas() {
  return (
    <Canvas
      gl={{
        alpha:           true,
        antialias:       true,
        powerPreference: 'high-performance',
        toneMapping:     THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
      }}
      camera={{ position: [0, 0.8, 9], fov: 55 }}
      style={{ background: 'transparent' }}
    >
      <Scene />
    </Canvas>
  )
}
